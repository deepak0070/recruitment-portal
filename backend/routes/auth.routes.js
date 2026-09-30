const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const { validateRequest } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');

router.post('/register', authLimiter, registerValidator, validateRequest, AuthController.register);
router.post('/login', authLimiter, loginValidator, validateRequest, AuthController.login);
router.get('/me', authenticate, AuthController.getMe);

module.exports = router;
