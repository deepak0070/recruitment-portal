const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const jobRoutes = require('./job.routes');

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);

module.exports = router;
