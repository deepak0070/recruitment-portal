const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const jobRoutes = require('./job.routes');
const applicationRoutes = require('./application.routes');

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);

module.exports = router;
