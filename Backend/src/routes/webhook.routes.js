const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

// Stripe webhook endpoint
// Note: This route should use raw body, not JSON parsed body
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  webhookController.handleStripeWebhook
);

module.exports = router;