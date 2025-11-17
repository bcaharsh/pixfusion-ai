const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const userValidation = require('../validations/user.validation');

// All routes require authentication
router.use(authMiddleware);

// Profile routes
router.get('/profile', userController.getProfile);

router.put(
  '/profile',
  validate(userValidation.updateProfile),
  userController.updateProfile
);

router.post('/avatar', userController.uploadAvatar);

router.delete('/avatar', userController.deleteAvatar);

// Statistics and usage
router.get('/statistics', userController.getStatistics);

router.get('/usage-history', userController.getUsageHistory);

router.get('/favorites', userController.getFavorites);

// Email update
router.put(
  '/email',
  validate(userValidation.updateEmail),
  userController.updateEmail
);

// Preferences
router.put('/preferences', userController.updatePreferences);

// Account deletion
router.delete(
  '/account',
  validate(userValidation.deleteAccount),
  userController.deleteAccount
);

module.exports = router;