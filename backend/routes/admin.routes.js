const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');
const {
  changeStatusValidator,
  addNoteValidator,
  jobApplicationsValidator,
  appIdParamValidator
} = require('../validators/admin.validator');
const { validateRequest } = require('../middleware/validate.middleware');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All admin routes require authentication and admin role
router.use(authenticate, authorize('admin'));

// Summary metrics & Activity logs
router.get('/stats', AdminController.getStats);
router.get('/activity', AdminController.getActivity);

// Job applications list per job with filter by status
router.get('/jobs/:id/applications', jobApplicationsValidator, validateRequest, AdminController.getJobApplications);

// Review individual applicant
router.get('/applications/:id', appIdParamValidator, validateRequest, AdminController.getApplication);

// Secure resume download / inline view
router.get('/applications/:id/resume', appIdParamValidator, validateRequest, AdminController.downloadResume);

// Update status through pipeline
router.patch('/applications/:id/status', changeStatusValidator, validateRequest, AdminController.updateStatus);

// Internal applicant evaluation notes (MongoDB)
router.post('/applications/:id/notes', addNoteValidator, validateRequest, AdminController.addNote);
router.get('/applications/:id/notes', appIdParamValidator, validateRequest, AdminController.getNotes);

module.exports = router;
