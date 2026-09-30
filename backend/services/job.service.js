const JobModel = require('../models/mysql/job.model');
const ActivityService = require('./activity.service');
const { AppError } = require('../middleware/error.middleware');

class JobService {
  /**
   * Get paginated job listings with search & filters
   */
  static async getJobs(query, currentUser = null) {
    const {
      search,
      location,
      jobType,
      status,
      page = 1,
      limit = 10
    } = query;

    // Non-admin or unauthenticated users can only view 'open' jobs
    const isUserAdmin = currentUser && currentUser.role === 'admin';
    const effectiveStatus = isUserAdmin ? (status || 'all') : 'open';

    return await JobModel.findAll({
      search,
      location,
      jobType,
      status: effectiveStatus,
      page,
      limit
    });
  }

  /**
   * Get single job by ID
   */
  static async getJobById(id) {
    const job = await JobModel.findById(id);
    if (!job) {
      throw new AppError('Job posting not found.', 404);
    }
    return job;
  }

  /**
   * Create new job posting (Admin)
   */
  static async createJob(jobData, adminUser) {
    const newJob = await JobModel.create({
      ...jobData,
      created_by: adminUser.id
    });

    // Audit log to MongoDB
    await ActivityService.log({
      action: 'JOB_CREATED',
      performedBy: {
        id: adminUser.id,
        name: adminUser.name,
        role: adminUser.role
      },
      targetType: 'job',
      targetId: newJob.id,
      metadata: {
        title: newJob.title,
        location: newJob.location,
        job_type: newJob.job_type,
        status: newJob.status
      }
    });

    return newJob;
  }

  /**
   * Update job posting (Admin)
   */
  static async updateJob(id, updateData, adminUser) {
    const existingJob = await this.getJobById(id);

    const updatedJob = await JobModel.update(id, updateData);

    const isStatusChange = updateData.status && updateData.status !== existingJob.status;

    // Audit log to MongoDB
    await ActivityService.log({
      action: isStatusChange ? (updateData.status === 'closed' ? 'JOB_CLOSED' : 'JOB_REOPENED') : 'JOB_UPDATED',
      performedBy: {
        id: adminUser.id,
        name: adminUser.name,
        role: adminUser.role
      },
      targetType: 'job',
      targetId: id,
      metadata: {
        changes: updateData,
        previousStatus: existingJob.status,
        newStatus: updateData.status || existingJob.status
      }
    });

    return updatedJob;
  }

  /**
   * Delete job posting (Admin)
   */
  static async deleteJob(id, adminUser) {
    const existingJob = await this.getJobById(id);

    await JobModel.delete(id);

    // Audit log to MongoDB
    await ActivityService.log({
      action: 'JOB_DELETED',
      performedBy: {
        id: adminUser.id,
        name: adminUser.name,
        role: adminUser.role
      },
      targetType: 'job',
      targetId: id,
      metadata: {
        deletedTitle: existingJob.title
      }
    });

    return { message: 'Job posting deleted successfully.' };
  }
}

module.exports = JobService;
