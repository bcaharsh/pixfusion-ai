const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment.model');
const Subscription = require('../models/Subscription.model');
const User = require('../models/User.model');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

const webhookController = {
  // Handle Stripe webhooks
  handleStripeWebhook: async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      logger.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(event.data.object);
          break;

        case 'customer.subscription.created':
          await handleSubscriptionCreated(event.data.object);
          break;

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object);
          break;

        case 'invoice.paid':
          await handleInvoicePaid(event.data.object);
          break;

        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object);
          break;

        case 'charge.refunded':
          await handleChargeRefunded(event.data.object);
          break;

        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      logger.error('Error handling webhook:', error);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  }
};

// Helper functions for handling different webhook events

async function handlePaymentIntentSucceeded(paymentIntent) {
  logger.info('Payment intent succeeded:', paymentIntent.id);

  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id
  });

  if (payment) {
    payment.status = 'completed';
    await payment.save();

    // Get user
    const user = await User.findById(payment.userId);
    if (user) {
      await emailService.sendPaymentSuccessEmail(
        user.email,
        user.name,
        payment.amount
      );
    }
  }
}

async function handlePaymentIntentFailed(paymentIntent) {
  logger.error('Payment intent failed:', paymentIntent.id);

  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id
  });

  if (payment) {
    payment.status = 'failed';
    payment.failureReason = paymentIntent.last_payment_error?.message;
    await payment.save();

    // Get user
    const user = await User.findById(payment.userId);
    if (user) {
      await emailService.sendPaymentFailedEmail(
        user.email,
        user.name,
        payment.amount
      );
    }
  }
}

async function handleSubscriptionCreated(stripeSubscription) {
  logger.info('Subscription created:', stripeSubscription.id);

  const subscription = await Subscription.findOne({
    stripeSubscriptionId: stripeSubscription.id
  });

  if (subscription) {
    subscription.status = 'active';
    await subscription.save();
  }
}

async function handleSubscriptionUpdated(stripeSubscription) {
  logger.info('Subscription updated:', stripeSubscription.id);

  const subscription = await Subscription.findOne({
    stripeSubscriptionId: stripeSubscription.id
  }).populate('userId planId');

  if (subscription) {
    // Update subscription status based on Stripe status
    const statusMap = {
      'active': 'active',
      'past_due': 'past_due',
      'canceled': 'cancelled',
      'incomplete': 'pending',
      'incomplete_expired': 'expired',
      'trialing': 'active',
      'unpaid': 'past_due'
    };

    subscription.status = statusMap[stripeSubscription.status] || subscription.status;
    await subscription.save();

    // If subscription was cancelled
    if (stripeSubscription.status === 'canceled') {
      const user = await User.findById(subscription.userId);
      if (user) {
        user.currentPlan = null;
        user.imagesRemaining = 3; // Free plan
        await user.save();

        await emailService.sendSubscriptionCancelled(
          user.email,
          user.name,
          subscription.planId.name
        );
      }
    }
  }
}

async function handleSubscriptionDeleted(stripeSubscription) {
  logger.info('Subscription deleted:', stripeSubscription.id);

  const subscription = await Subscription.findOne({
    stripeSubscriptionId: stripeSubscription.id
  }).populate('userId planId');

  if (subscription) {
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();

    const user = await User.findById(subscription.userId);
    if (user) {
      user.currentPlan = null;
      user.imagesRemaining = 3;
      await user.save();
    }
  }
}

async function handleInvoicePaid(invoice) {
  logger.info('Invoice paid:', invoice.id);

  // Create payment record
  if (invoice.subscription) {
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: invoice.subscription
    }).populate('planId');

    if (subscription) {
      await Payment.create({
        userId: subscription.userId,
        subscriptionId: subscription._id,
        planId: subscription.planId._id,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency.toUpperCase(),
        stripePaymentIntentId: invoice.payment_intent,
        stripeInvoiceId: invoice.id,
        paymentMethod: 'card',
        status: 'completed'
      });

      // Reset monthly usage
      subscription.imagesUsed = 0;
      await subscription.save();

      // Update user
      const user = await User.findById(subscription.userId);
      if (user) {
        user.imagesRemaining = subscription.planId.imageLimit;
        await user.save();
      }
    }
  }
}

async function handleInvoicePaymentFailed(invoice) {
  logger.error('Invoice payment failed:', invoice.id);

  if (invoice.subscription) {
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: invoice.subscription
    }).populate('userId');

    if (subscription) {
      subscription.status = 'past_due';
      await subscription.save();

      const user = subscription.userId;
      await emailService.sendPaymentFailedEmail(
        user.email,
        user.name,
        invoice.amount_due / 100
      );
    }
  }
}

async function handleChargeRefunded(charge) {
  logger.info('Charge refunded:', charge.id);

  const payment = await Payment.findOne({
    stripePaymentIntentId: charge.payment_intent
  }).populate('userId');

  if (payment) {
    payment.status = 'refunded';
    payment.refundedAt = new Date();
    await payment.save();

    if (payment.userId) {
      await emailService.sendRefundProcessedEmail(
        payment.userId.email,
        payment.userId.name,
        payment.amount
      );
    }
  }
}

module.exports = webhookController;