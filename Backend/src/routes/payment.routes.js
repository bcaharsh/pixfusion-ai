const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { paymentLimiter } = require('../middleware/rateLimiter.middleware');

// All routes require authentication
router.use(authMiddleware);

// Create payment intent
router.post(
  '/create-intent',
  paymentLimiter,
  paymentController.createPaymentIntent
);

// Confirm payment
router.post(
  '/confirm',
  paymentLimiter,
  paymentController.confirmPayment
);

// Get payment history
router.get('/history', paymentController.getPaymentHistory);

// Get specific payment
router.get('/:id', paymentController.getPaymentById);

// Get invoice
router.get('/:id/invoice', paymentController.getInvoice);

// Download invoice
router.get('/:id/invoice/download', paymentController.downloadInvoice);

// Request refund
router.post('/:id/refund', paymentController.requestRefund);

// Payment methods management
router.get('/methods/list', paymentController.getPaymentMethods);

router.post('/methods/add', paymentController.addPaymentMethod);

router.delete('/methods/:paymentMethodId', paymentController.removePaymentMethod);

router.put('/methods/default', paymentController.setDefaultPaymentMethod);

module.exports = router;