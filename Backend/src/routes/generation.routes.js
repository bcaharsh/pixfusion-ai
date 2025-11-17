const express = require('express');
const router = express.Router();
const generationController = require('../controllers/generation.controller');
const { authMiddleware, optionalAuth } = require('../middleware/auth.middleware');
const { checkImageLimit } = require('../middleware/checkImageLimit.middleware');
const validate = require('../middleware/validate.middleware');
const generationValidation = require('../validations/generation.validation');
const { generationLimiter } = require('../middleware/rateLimiter.middleware');

// Public routes
router.get(
  '/public',
  optionalAuth,
  validate(generationValidation.listGenerations),
  generationController.getPublicGenerations
);

// Protected routes
router.use(authMiddleware);

// Create generation
router.post(
  '/create',
  generationLimiter,
  checkImageLimit,
  validate(generationValidation.createGeneration),
  generationController.createGeneration
);

// Get user's generation history
router.get(
  '/history',
  validate(generationValidation.listGenerations),
  generationController.getHistory
);

// Get specific generation
router.get(
  '/:id',
  validate(generationValidation.getGeneration),
  generationController.getGeneration
);

// Update generation
router.patch(
  '/:id',
  validate(generationValidation.updateGeneration),
  generationController.updateGeneration
);

// Delete generation
router.delete(
  '/:id',
  validate(generationValidation.deleteGeneration),
  generationController.deleteGeneration
);

// Batch delete
router.post(
  '/batch-delete',
  validate(generationValidation.batchDelete),
  generationController.batchDelete
);

// Retry failed generation
router.post(
  '/:id/retry',
  checkImageLimit,
  validate(generationValidation.getGeneration),
  generationController.retryGeneration
);

// Get generation status
router.get(
  '/:id/status',
  validate(generationValidation.getGeneration),
  generationController.getStatus
);

module.exports = router;