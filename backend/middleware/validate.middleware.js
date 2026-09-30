const { validationResult } = require('express-validator');
const { AppError } = require('./error.middleware');

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));
    return next(new AppError('Validation failed. Please check your inputs.', 400, errorDetails));
  }
  next();
}

module.exports = {
  validateRequest
};
