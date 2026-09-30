const express = require('express');
const router = express.Router();
const JobController = require('../controllers/job.controller');
const ExternalJobsController = require('../controllers/externalJobs.controller');
const {
  createJobValidator,
  updateJobValidator,
  getJobsValidator,
  jobIdValidator
} = require('../validators/job.validator');
const { validateRequest } = require('../middleware/validate.middleware');
const { authenticate, authorize, optionalAuthenticate } = require('../middleware/auth.middleware');

// Real-time external job search and 1-click admin import
router.get('/external/live', ExternalJobsController.getLiveJobs);
router.post(
  '/external/import',
  authenticate,
  authorize('admin'),
  ExternalJobsController.importJob
);

// Public endpoints (with optional auth to detect admin preferences)
router.get('/', optionalAuthenticate, getJobsValidator, validateRequest, JobController.getJobs);
router.get('/:id', jobIdValidator, validateRequest, JobController.getJobById);

// Admin-only CRUD
router.post(
  '/',
  authenticate,
  authorize('admin'),
  createJobValidator,
  validateRequest,
  JobController.createJob
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  updateJobValidator,
  validateRequest,
  JobController.updateJob
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  jobIdValidator,
  validateRequest,
  JobController.deleteJob
);

const ApplicationController = require('../controllers/application.controller');
const { uploadResume } = require('../middleware/upload.middleware');
const { applyJobValidator } = require('../validators/application.validator');

// Candidate application submission
router.post(
  '/:id/apply',
  authenticate,
  authorize('candidate'),
  uploadResume,
  applyJobValidator,
  validateRequest,
  ApplicationController.apply
);

module.exports = router;
