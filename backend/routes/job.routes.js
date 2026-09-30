const express = require('express');
const router = express.Router();
const JobController = require('../controllers/job.controller');
const {
  createJobValidator,
  updateJobValidator,
  getJobsValidator,
  jobIdValidator
} = require('../validators/job.validator');
const { validateRequest } = require('../middleware/validate.middleware');
const { authenticate, authorize, optionalAuthenticate } = require('../middleware/auth.middleware');

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

module.exports = router;
