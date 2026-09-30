const jwt = require('jsonwebtoken');
const config = require('../config');
const { AppError } = require('./error.middleware');
const UserModel = require('../models/mysql/user.model');

/**
 * Authenticate JWT token from Authorization header
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Bearer token missing.', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Authentication required. Token missing.', 401);
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Verify user still exists in database
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      throw new AppError('The account belonging to this token no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Authorize specific roles
 * @param  {...string} roles - e.g. 'admin', 'candidate'
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required before checking permissions.', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Access forbidden: ${req.user.role} role cannot perform this action.`, 403));
    }
    next();
  };
}

module.exports = {
  authenticate,
  authorize
};
