const express = require('express');
const router = express.Router();
const ApplicationController = require('../controllers/application.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// GET /api/applications/mine - Candidate's applied jobs and current status
router.get('/mine', authenticate, authorize('candidate'), ApplicationController.getMyApplications);

module.exports = router;
