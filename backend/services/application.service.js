const fs = require('fs');
const path = require('path');
const ApplicationModel = require('../models/mysql/application.model');
const JobModel = require('../models/mysql/job.model');
const ActivityService = require('./activity.service');
const { AppError } = require('../middleware/error.middleware');
const config = require('../config');

class ApplicationService {
  /**
   * Submit application to an open job
   */
  static async applyToJob({ jobId, candidateUser, file, coverNote }) {
    if (!file) {
      throw new AppError('Resume file (PDF) is required.', 400);
    }

    // 1. Verify job exists and is open
    const job = await JobModel.findById(jobId);
    if (!job) {
      this._cleanupFile(file.path);
      throw new AppError('Job posting not found.', 404);
    }

    if (job.status !== 'open') {
      this._cleanupFile(file.path);
      throw new AppError('This job posting is closed and no longer accepting applications.', 400);
    }

    // 2. Prevent duplicate applications
    const existing = await ApplicationModel.findByJobAndUser(jobId, candidateUser.id);
    if (existing) {
      this._cleanupFile(file.path);
      throw new AppError('You have already applied for this job opening.', 409);
    }

    // 3. Create application record
    const application = await ApplicationModel.create({
      job_id: jobId,
      user_id: candidateUser.id,
      resume_path: file.filename,
      cover_note: coverNote
    });

    // 4. Log to MongoDB Activity
    await ActivityService.log({
      action: 'APPLICATION_SUBMITTED',
      performedBy: {
        id: candidateUser.id,
        name: candidateUser.name,
        role: candidateUser.role
      },
      targetType: 'application',
      targetId: application.id,
      metadata: {
        jobId: job.id,
        jobTitle: job.title,
        resumeFilename: file.filename
      }
    });

    return application;
  }

  /**
   * Retrieve applications submitted by the logged-in candidate
   */
  static async getCandidateApplications(candidateId) {
    return await ApplicationModel.findByCandidate(candidateId);
  }

  /**
   * Helper to clean up uploaded file in case of error
   */
  static _cleanupFile(filePath) {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Failed to clean up uploaded file:', err.message);
      }
    }
  }
}

module.exports = ApplicationService;
