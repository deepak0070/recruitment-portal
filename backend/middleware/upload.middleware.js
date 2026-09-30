const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const { AppError } = require('./error.middleware');

// Ensure upload directory exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const candidateId = req.user ? req.user.id : 'anon';
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
    cb(null, `resume-${candidateId}-${timestamp}-${randomSuffix}${ext}`);
  }
});

// File filter for PDF only
const fileFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = path.extname(file.originalname).toLowerCase() === '.pdf';

  if (isPdfMime && isPdfExt) {
    cb(null, true);
  } else {
    req.fileValidationError = 'Invalid file format. Only PDF resumes are accepted.';
    cb(null, false);
  }
};

const multerInstance = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB limit
  }
});

/**
 * Robust wrapper for single resume upload
 */
function uploadResume(req, res, next) {
  multerInstance.single('resume')(req, res, (err) => {
    if (err) {
      return next(err);
    }
    if (req.fileValidationError) {
      return next(new AppError(req.fileValidationError, 400));
    }
    next();
  });
}

module.exports = {
  uploadResume
};
