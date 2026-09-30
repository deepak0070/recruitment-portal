const ApplicationService = require('../services/application.service');

class ApplicationController {
  static async apply(req, res, next) {
    try {
      const jobId = req.params.id;
      const { cover_note } = req.body;
      const file = req.file;

      const application = await ApplicationService.applyToJob({
        jobId,
        candidateUser: req.user,
        file,
        coverNote: cover_note
      });

      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: application
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyApplications(req, res, next) {
    try {
      const applications = await ApplicationService.getCandidateApplications(req.user.id);
      return res.status(200).json({
        success: true,
        data: applications
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ApplicationController;
