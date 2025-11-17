const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { authMiddleware, optionalAuth } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const subscriptionValidation = require('../validations/subscription.validation');

// Public routes
router.get('/plans', subscriptionController.getPlans);

router.get(
  '/plans/:id',
  validate(subscriptionValidation.getPlanById),
  subscriptionController.getPlanById
);

// Protected routes
router.use(authMiddleware);

// Subscribe to a plan
router.post(
  '/subscribe',
  validate(subscriptionValidation.subscribe),
  subscriptionController.subscribe
);

// Get current subscription
router.get('/current', subscriptionController.getCurrentSubscription);

// Get subscription history
router.get('/history', subscriptionController.getSubscriptionHistory);

// Cancel subscription
router.post(
  '/cancel',
  validate(subscriptionValidation.cancelSubscription),
  subscriptionController.cancelSubscription
);

// Reactivate subscription
router.post(
  '/:id/reactivate',
  validate(subscriptionValidation.reactivateSubscription),
  subscriptionController.reactivateSubscription
);

// Change plan
router.post(
  '/change-plan',
  validate(subscriptionValidation.changePlan),
  subscriptionController.changePlan
);

// Update payment method
router.put(
  '/payment-method',
  subscriptionController.updatePaymentMethod
);

module.exports = router;