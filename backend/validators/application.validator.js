const { body, param, query } = require('express-validator');

const applyJobValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Valid Job ID is required'),
  body('cover_note')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 3000 }).withMessage('Cover note cannot exceed 3000 characters')
];

const applicationIdValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Valid Application ID is required')
];

const updateStatusValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Valid Application ID is required'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['applied', 'shortlisted', 'interview', 'offered', 'rejected'])
    .withMessage('Invalid status. Allowed values: applied, shortlisted, interview, offered, rejected')
];

const getJobApplicationsValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Valid Job ID is required'),
  query('status')
    .optional()
    .isIn(['applied', 'shortlisted', 'interview', 'offered', 'rejected', 'all'])
    .withMessage('Invalid status filter')
];

module.exports = {
  applyJobValidator,
  applicationIdValidator,
  updateStatusValidator,
  getJobApplicationsValidator
};
