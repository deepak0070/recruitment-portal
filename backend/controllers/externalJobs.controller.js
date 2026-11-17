const ExternalJobsService = require('../services/externalJobs.service');

class ExternalJobsController {
  /**
   * Search real-time jobs from Adzuna / Jooble / Live India Feeds
   * GET /api/jobs/external/live
   */
  static async getLiveJobs(req, res, next) {
    try {
      const { query, location, experience, page, limit, provider } = req.query;
      const result = await ExternalJobsService.searchLiveJobs({
        query: query ? String(query).trim() : '',
        location: location ? String(location).trim() : '',
        experience: experience ? String(experience).trim() : '',
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        provider: provider ? String(provider).toLowerCase() : 'all'
      });

      return res.status(200).json({
        success: true,
        data: result.jobs,
        pagination: {
          total: result.total,
          page: result.page || parseInt(page || 1, 10),
          limit: result.limit || parseInt(limit || 10, 10),
          provider: result.provider,
          notice: result.notice || null
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 1-Click Import of external job posting into portal database
   * POST /api/jobs/external/import
   * Requires Admin authentication
   */
  static async importJob(req, res, next) {
    try {
      const { title, description, location, jobType, experienceLevel, salaryRange, applyUrl, source } = req.body;

      if (!title || !description || !location) {
        return res.status(400).json({
          success: false,
          error: 'Title, description, and location are required to import a job'
        });
      }

      const importedJob = await ExternalJobsService.importJobToPortal(
        {
          title,
          description,
          location,
          jobType,
          experienceLevel,
          salaryRange,
          applyUrl,
          source
        },
        req.user
      );

      return res.status(201).json({
        success: true,
        message: 'Job posting successfully imported to recruitment portal',
        data: importedJob
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ExternalJobsController;
