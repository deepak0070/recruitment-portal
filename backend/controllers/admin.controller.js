const AdminService = require('../services/admin.service');

class AdminController {
  static async getStats(req, res, next) {
    try {
      const stats = await AdminService.getStats();
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  static async getJobApplications(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.query;
      const result = await AdminService.getJobApplications(id, status);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getApplication(req, res, next) {
    try {
      const { id } = req.params;
      const application = await AdminService.getApplicationDetails(id);
      return res.status(200).json({
        success: true,
        data: application
      });
    } catch (error) {
      next(error);
    }
  }

  static async downloadResume(req, res, next) {
    try {
      const { id } = req.params;
      const { filePath, fileName } = await AdminService.getResumePath(id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
      return res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await AdminService.updateApplicationStatus(id, status, req.user);
      return res.status(200).json({
        success: true,
        message: `Application status updated to '${status}' successfully`,
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  static async addNote(req, res, next) {
    try {
      const { id } = req.params;
      const { note } = req.body;
      const noteDoc = await AdminService.addApplicantNote(id, note, req.user);
      return res.status(201).json({
        success: true,
        message: 'Applicant note recorded successfully',
        data: noteDoc
      });
    } catch (error) {
      next(error);
    }
  }

  static async getNotes(req, res, next) {
    try {
      const { id } = req.params;
      const notes = await AdminService.getApplicantNotes(id);
      return res.status(200).json({
        success: true,
        data: notes
      });
    } catch (error) {
      next(error);
    }
  }

  static async getActivity(req, res, next) {
    try {
      const limit = parseInt(req.query.limit || '30', 10);
      const skip = parseInt(req.query.skip || '0', 10);
      const activity = await AdminService.getActivityTimeline(limit, skip);
      return res.status(200).json({
        success: true,
        data: activity
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
