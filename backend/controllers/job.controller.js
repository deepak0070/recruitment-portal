const JobService = require('../services/job.service');

class JobController {
  static async getJobs(req, res, next) {
    try {
      const result = await JobService.getJobs(req.query, req.user);
      return res.status(200).json({
        success: true,
        data: result.jobs,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  static async getJobById(req, res, next) {
    try {
      const job = await JobService.getJobById(req.params.id);
      return res.status(200).json({
        success: true,
        data: job
      });
    } catch (error) {
      next(error);
    }
  }

  static async createJob(req, res, next) {
    try {
      const job = await JobService.createJob(req.body, req.user);
      return res.status(201).json({
        success: true,
        message: 'Job posting created successfully',
        data: job
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateJob(req, res, next) {
    try {
      const job = await JobService.updateJob(req.params.id, req.body, req.user);
      return res.status(200).json({
        success: true,
        message: 'Job posting updated successfully',
        data: job
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteJob(req, res, next) {
    try {
      const result = await JobService.deleteJob(req.params.id, req.user);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = JobController;
