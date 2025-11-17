const stripe = require('../config/stripe');
const Payment = require('../models/Payment.model');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const paymentService = {
  // Create payment intent
  createPaymentIntent: async ({ amount, currency, userId, planId, metadata = {} }) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: {
            userId: userId.toString()
          }
        });
        
        customerId = customer.id;
        user.stripeCustomerId = customerId;
        await user.save();
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        customer: customerId,
        metadata: {
          userId: userId.toString(),
          planId: planId?.toString(),
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true
        }
      });

      logger.info('Payment intent created', {
        paymentIntentId: paymentIntent.id,
        amount,
        userId
      });

      return paymentIntent;
    } catch (error) {
      logger.error('Error creating payment intent:', error);
      throw new ApiError(500, `Payment initialization failed: ${error.message}`);
    }
  },

  // Create payment record
  createPayment: async ({
    userId,
    subscriptionId,
    planId,
    amount,
    paymentMethodId
  }) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Create payment intent
      const paymentIntent = await paymentService.createPaymentIntent({
        amount,
        currency: 'USD',
        userId,
        planId,
        metadata: {
          subscriptionId: subscriptionId?.toString()
        }
      });

      // Confirm payment with payment method
      const confirmedPayment = await stripe.paymentIntents.confirm(
        paymentIntent.id,
        {
          payment_method: paymentMethodId
        }
      );

      // Create payment record
      const payment = await Payment.create({
        userId,
        subscriptionId,
        planId,
        amount,
        currency: 'USD',
        stripePaymentIntentId: confirmedPayment.id,
        paymentMethod: 'card',
        status: confirmedPayment.status === 'succeeded' ? 'completed' : 'pending'
      });

      return payment;
    } catch (error) {
      logger.error('Error creating payment:', error);
      throw new ApiError(500, `Payment processing failed: ${error.message}`);
    }
  },

  // Retrieve payment intent
  retrievePaymentIntent: async (paymentIntentId) => {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      logger.error('Error retrieving payment intent:', error);
      throw new ApiError(500, 'Failed to retrieve payment details');
    }
  },

  // Create refund
  createRefund: async (paymentIntentId, reason = null) => {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        reason: reason || 'requested_by_customer'
      });

      logger.info('Refund created', {
        refundId: refund.id,
        paymentIntentId
      });

      return refund;
    } catch (error) {
      logger.error('Error creating refund:', error);
      throw new ApiError(500, `Refund processing failed: ${error.message}`);
    }
  },

  // Get customer payment methods
  getCustomerPaymentMethods: async (userId) => {
    try {
      const user = await User.findById(userId);
      if (!user || !user.stripeCustomerId) {
        return [];
      }

      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card'
      });

      return paymentMethods.data;
    } catch (error) {
      logger.error('Error getting payment methods:', error);
      throw new ApiError(500, 'Failed to retrieve payment methods');
    }
  },

  // Attach payment method to customer
  attachPaymentMethod: async (paymentMethodId, userId) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Create customer if doesn't exist
      if (!user.stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name
        });
        user.stripeCustomerId = customer.id;
        await user.save();
      }

      // Attach payment method
      const paymentMethod = await stripe.paymentMethods.attach(
        paymentMethodId,
        { customer: user.stripeCustomerId }
      );

      return paymentMethod;
    } catch (error) {
      logger.error('Error attaching payment method:', error);
      throw new ApiError(500, 'Failed to add payment method');
    }
  },

  // Detach payment method
  detachPaymentMethod: async (paymentMethodId) => {
    try {
      const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
      return paymentMethod;
    } catch (error) {
      logger.error('Error detaching payment method:', error);
      throw new ApiError(500, 'Failed to remove payment method');
    }
  },

  // Set default payment method
  setDefaultPaymentMethod: async (userId, paymentMethodId) => {
    try {
      const user = await User.findById(userId);
      if (!user || !user.stripeCustomerId) {
        throw new ApiError(404, 'User or customer not found');
      }

      await stripe.customers.update(user.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });

      return true;
    } catch (error) {
      logger.error('Error setting default payment method:', error);
      throw new ApiError(500, 'Failed to set default payment method');
    }
  },

  // Cancel Stripe subscription
  cancelStripeSubscription: async (subscriptionId, atPeriodEnd = true) => {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: atPeriodEnd
      });

      if (!atPeriodEnd) {
        await stripe.subscriptions.cancel(subscriptionId);
      }

      return subscription;
    } catch (error) {
      logger.error('Error cancelling Stripe subscription:', error);
      throw new ApiError(500, 'Failed to cancel subscription');
    }
  },

  // Update payment method for subscription
  updatePaymentMethod: async (subscriptionId, paymentMethodId) => {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        default_payment_method: paymentMethodId
      });

      return subscription;
    } catch (error) {
      logger.error('Error updating subscription payment method:', error);
      throw new ApiError(500, 'Failed to update payment method');
    }
  }
};

module.exports = paymentService;