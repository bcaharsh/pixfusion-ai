const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const authValidation = require('../validations/auth.validation');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter.middleware');

// Public routes
router.post(
  '/register',
  authLimiter,
  validate(authValidation.register),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validate(authValidation.login),
  authController.login
);

router.post(
  '/refresh-token',
  validate(authValidation.refreshToken),
  authController.refreshToken
);

router.post(
  '/forgot-password',
  passwordResetLimiter,
  validate(authValidation.forgotPassword),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  passwordResetLimiter,
  validate(authValidation.resetPassword),
  authController.resetPassword
);

router.post(
  '/verify-email',
  validate(authValidation.verifyEmail),
  authController.verifyEmail
);

// Protected routes
router.use(authMiddleware);

router.get('/me', authController.getCurrentUser);

router.post('/logout', authController.logout);

router.post(
  '/change-password',
  validate(authValidation.changePassword),
  authController.changePassword
);

module.exports = router;