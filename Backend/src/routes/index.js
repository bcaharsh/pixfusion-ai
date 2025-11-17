const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const generationRoutes = require('./generation.routes');
const subscriptionRoutes = require('./subscription.routes');
const paymentRoutes = require('./payment.routes');
const adminRoutes = require('./admin.routes');
const webhookRoutes = require('./webhook.routes');

// API Info
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Image9 AI Image Generation API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      user: '/api/v1/user',
      generation: '/api/v1/generation',
      subscription: '/api/v1/subscription',
      payment: '/api/v1/payment',
      admin: '/api/v1/admin',
      webhook: '/api/v1/webhook'
    },
    documentation: '/api/v1/docs',
    status: 'operational'
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/generation', generationRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/payment', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/webhook', webhookRoutes);

module.exports = router;