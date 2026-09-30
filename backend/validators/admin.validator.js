const { body, param, query } = require('express-validator');

const changeStatusValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Valid Application ID is required'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['applied', 'shortlisted', 'interview', 'offered', 'rejected'])
    .withMessage('Status must be one of: applied, shortlisted, interview, offered, rejected')
];

const addNoteValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Valid Application ID is required'),
  body('note')
    .trim()
    .notEmpty().withMessage('Note text is required')
    .isLength({ min: 2, max: 2000 }).withMessage('Note must be between 2 and 2000 characters')
];

const jobApplicationsValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Valid Job ID is required'),
  query('status')
    .optional()
    .isIn(['applied', 'shortlisted', 'interview', 'offered', 'rejected', 'all'])
    .withMessage('Status filter must be applied, shortlisted, interview, offered, rejected, or all')
];

const appIdParamValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Valid Application ID is required')
];

module.exports = {
  changeStatusValidator,
  addNoteValidator,
  jobApplicationsValidator,
  appIdParamValidator
};
