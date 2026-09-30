const { body, query, param } = require('express-validator');

const createJobValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Job title is required')
    .isLength({ min: 3, max: 150 }).withMessage('Title must be between 3 and 150 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Job description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('location')
    .trim()
    .notEmpty().withMessage('Location is required'),
  body('job_type')
    .trim()
    .notEmpty().withMessage('Job type is required'),
  body('salary_range')
    .optional({ nullable: true })
    .trim(),
  body('status')
    .optional()
    .isIn(['open', 'closed']).withMessage('Status must be open or closed')
];

const updateJobValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Job ID must be a positive integer'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 }).withMessage('Title must be between 3 and 150 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('location')
    .optional()
    .trim()
    .notEmpty().withMessage('Location cannot be empty'),
  body('job_type')
    .optional()
    .trim()
    .notEmpty().withMessage('Job type cannot be empty'),
  body('salary_range')
    .optional({ nullable: true })
    .trim(),
  body('status')
    .optional()
    .isIn(['open', 'closed']).withMessage('Status must be open or closed')
];

const getJobsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['open', 'closed', 'all']).withMessage('Status must be open, closed, or all')
];

const jobIdValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Job ID must be a positive integer')
];

module.exports = {
  createJobValidator,
  updateJobValidator,
  getJobsValidator,
  jobIdValidator
};
