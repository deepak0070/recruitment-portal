const fs = require('fs');
const path = require('path');
const config = require('../config');
const { query } = require('../config/db.mysql');
const ApplicationModel = require('../models/mysql/application.model');
const JobModel = require('../models/mysql/job.model');
const ApplicantNote = require('../models/mongo/applicantNote.model');
const ActivityService = require('./activity.service');
const { AppError } = require('../middleware/error.middleware');

class AdminService {
  /**
   * Get administrative metrics for dashboard cards
   */
  static async getStats() {
    // 1. Job statistics
    const [jobStats] = await query(`
      SELECT 
        COUNT(*) AS total_jobs,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open_jobs,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) AS closed_jobs
      FROM jobs
    `);

    // 2. Total applicants
    const totalApplicants = await ApplicationModel.countTotal();

    // 3. Counts per status
    const statusCounts = await ApplicationModel.countByStatus();

    return {
      jobs: {
        total: parseInt(jobStats.total_jobs || 0, 10),
        open: parseInt(jobStats.open_jobs || 0, 10),
        closed: parseInt(jobStats.closed_jobs || 0, 10)
      },
      totalApplicants,
      statusCounts
    };
  }

  /**
   * Get applications for a specific job with optional status filter
   */
  static async getJobApplications(jobId, statusFilter) {
    const job = await JobModel.findById(jobId);
    if (!job) {
      throw new AppError('Job not found.', 404);
    }

    const applications = await ApplicationModel.findByJob(jobId, statusFilter);
    return {
      job: {
        id: job.id,
        title: job.title,
        status: job.status,
        location: job.location
      },
      applications
    };
  }

  /**
   * Get detailed application record including internal MongoDB notes
   */
  static async getApplicationDetails(applicationId) {
    const application = await ApplicationModel.findById(applicationId);
    if (!application) {
      throw new AppError('Application not found.', 404);
    }

    let notes = [];
    try {
      notes = await ApplicantNote.find({ applicationId })
        .sort({ createdAt: -1 })
        .lean();
    } catch (err) {
      console.warn(`[AdminService] Unable to fetch notes from MongoDB: ${err.message}`);
    }

    return {
      ...application,
      notes
    };
  }

  /**
   * Update application status through pipeline:
   * Applied -> Shortlisted -> Interview -> Offered / Rejected
   */
  static async updateApplicationStatus(applicationId, newStatus, adminUser) {
    const application = await ApplicationModel.findById(applicationId);
    if (!application) {
      throw new AppError('Application not found.', 404);
    }

    const currentStatus = application.status;
    if (currentStatus === newStatus) {
      return application;
    }

    // Pipeline transition rules
    const allowedTransitions = {
      applied: ['shortlisted', 'rejected'],
      shortlisted: ['interview', 'rejected'],
      interview: ['offered', 'rejected'],
      offered: ['rejected'],
      rejected: ['shortlisted'] // Allow re-opening rejected candidates for a second look
    };

    const validNextSteps = allowedTransitions[currentStatus] || [];
    if (!validNextSteps.includes(newStatus)) {
      throw new AppError(
        `Invalid pipeline transition from '${currentStatus}' to '${newStatus}'. Allowed: ${validNextSteps.join(', ') || 'none'}`,
        400
      );
    }

    // Update in MySQL
    const updatedApplication = await ApplicationModel.updateStatus(applicationId, newStatus);

    // Audit log in MongoDB
    await ActivityService.log({
      action: 'STATUS_CHANGED',
      performedBy: {
        id: adminUser.id,
        name: adminUser.name,
        role: adminUser.role
      },
      targetType: 'application',
      targetId: applicationId,
      metadata: {
        candidateName: application.candidate_name,
        jobTitle: application.job_title,
        previousStatus: currentStatus,
        newStatus
      }
    });

    return updatedApplication;
  }

  /**
   * Add internal note on an applicant (saved in MongoDB)
   */
  static async addApplicantNote(applicationId, noteText, adminUser) {
    const application = await ApplicationModel.findById(applicationId);
    if (!application) {
      throw new AppError('Application not found.', 404);
    }

    let noteDoc;
    try {
      noteDoc = await ApplicantNote.create({
        applicationId: parseInt(applicationId, 10),
        adminId: adminUser.id,
        adminName: adminUser.name,
        note: noteText.trim()
      });
    } catch (err) {
      throw new AppError(`Failed to save note to MongoDB: ${err.message}`, 500);
    }

    // Audit log
    await ActivityService.log({
      action: 'NOTE_ADDED',
      performedBy: {
        id: adminUser.id,
        name: adminUser.name,
        role: adminUser.role
      },
      targetType: 'application',
      targetId: applicationId,
      metadata: {
        candidateName: application.candidate_name,
        jobTitle: application.job_title
      }
    });

    return noteDoc;
  }

  /**
   * Get all internal notes for an applicant from MongoDB
   */
  static async getApplicantNotes(applicationId) {
    const application = await ApplicationModel.findById(applicationId);
    if (!application) {
      throw new AppError('Application not found.', 404);
    }

    try {
      return await ApplicantNote.find({ applicationId: parseInt(applicationId, 10) })
        .sort({ createdAt: -1 })
        .lean();
    } catch (err) {
      console.warn(`[AdminService] Error fetching notes from MongoDB: ${err.message}`);
      return [];
    }
  }

  /**
   * Get recent activity timeline from MongoDB
   */
  static async getActivityTimeline(limit = 30, skip = 0) {
    return await ActivityService.getRecentLogs(limit, skip);
  }

  /**
   * Locate and verify resume file path for authorized download
   */
  static async getResumePath(applicationId) {
    const application = await ApplicationModel.findById(applicationId);
    if (!application) {
      throw new AppError('Application not found.', 404);
    }

    if (!application.resume_path) {
      throw new AppError('No resume uploaded for this application.', 404);
    }

    const fullPath = path.resolve(config.uploadDir, application.resume_path);
    if (!fs.existsSync(fullPath)) {
      throw new AppError('Resume file not found on server.', 404);
    }

    return {
      filePath: fullPath,
      fileName: `Resume-${application.candidate_name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
    };
  }
}

module.exports = AdminService;
