const Payment = require('../models/Payment.model');
const Subscription = require('../models/Subscription.model');
const Plan = require('../models/Plan.model');
const paymentService = require('../services/payment.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const paymentController = {
  // Create payment intent
  createPaymentIntent: asyncHandler(async (req, res) => {
    const { planId, billingCycle } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new ApiError(404, 'Plan not found');
    }

    if (!plan.isActive) {
      throw new ApiError(400, 'This plan is no longer available');
    }

    // Create payment intent
    const paymentIntent = await paymentService.createPaymentIntent({
      amount: plan.price,
      currency: plan.currency.toLowerCase(),
      userId: req.user.id,
      planId,
      metadata: {
        userId: req.user.id,
        planId: plan._id.toString(),
        planName: plan.name,
        billingCycle: billingCycle || plan.billingCycle
      }
    });

    res.json(
      new ApiResponse(200, {
        clientSecret: paymentIntent.client_secret,
        amount: plan.price,
        currency: plan.currency
      }, 'Payment intent created successfully')
    );
  }),

  // Confirm payment
  confirmPayment: asyncHandler(async (req, res) => {
    const { paymentIntentId } = req.body;

    // Verify payment with Stripe
    const paymentIntent = await paymentService.retrievePaymentIntent(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new ApiError(400, 'Payment not completed');
    }

    // Create payment record
    const payment = await Payment.create({
      userId: req.user.id,
      planId: paymentIntent.metadata.planId,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency.toUpperCase(),
      stripePaymentIntentId: paymentIntent.id,
      paymentMethod: 'card',
      status: 'completed'
    });

    res.json(
      new ApiResponse(200, {
        payment,
        message: 'Payment confirmed successfully'
      })
    );
  }),

  // Get payment history
  getPaymentHistory: asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    const payments = await Payment.find({ userId: req.user.id })
      .populate('planId', 'name')
      .populate('subscriptionId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Payment.countDocuments({ userId: req.user.id });

    res.json(
      new ApiResponse(200, {
        payments,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        total: count
      }, 'Payment history retrieved successfully')
    );
  }),

  // Get payment by ID
  getPaymentById: asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id)
      .populate('planId')
      .populate('subscriptionId');

    if (!payment) {
      throw new ApiError(404, 'Payment not found');
    }

    // Check ownership
    if (payment.userId.toString() !== req.user.id) {
      throw new ApiError(403, 'You do not have permission to view this payment');
    }

    res.json(
      new ApiResponse(200, { payment }, 'Payment retrieved successfully')
    );
  }),

  // Get invoice
  getInvoice: asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('planId')
      .populate('subscriptionId');

    if (!payment) {
      throw new ApiError(404, 'Payment not found');
    }

    // Check ownership
    if (payment.userId._id.toString() !== req.user.id) {
      throw new ApiError(403, 'You do not have permission to view this invoice');
    }

    const invoice = {
      invoiceNumber: `INV-${payment._id}`,
      date: payment.createdAt,
      dueDate: payment.createdAt,
      status: payment.status,
      customer: {
        name: payment.userId.name,
        email: payment.userId.email
      },
      items: [
        {
          description: `${payment.planId.name} Subscription`,
          quantity: 1,
          unitPrice: payment.amount,
          total: payment.amount
        }
      ],
      subtotal: payment.amount,
      tax: 0,
      total: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod
    };

    res.json(
      new ApiResponse(200, { invoice }, 'Invoice retrieved successfully')
    );
  }),

  // Download invoice (generate PDF)
  downloadInvoice: asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('planId');

    if (!payment) {
      throw new ApiError(404, 'Payment not found');
    }

    // Check ownership
    if (payment.userId._id.toString() !== req.user.id) {
      throw new ApiError(403, 'You do not have permission to download this invoice');
    }

    // For now, return invoice data
    // In production, you would generate a PDF here
    res.json(
      new ApiResponse(200, {
        message: 'Invoice download feature - implement PDF generation',
        payment
      })
    );
  }),

  // Request refund
  requestRefund: asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      throw new ApiError(404, 'Payment not found');
    }

    // Check ownership
    if (payment.userId.toString() !== req.user.id) {
      throw new ApiError(403, 'You do not have permission to refund this payment');
    }

    if (payment.status === 'refunded') {
      throw new ApiError(400, 'This payment has already been refunded');
    }

    // Check if payment is eligible for refund (within 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (payment.createdAt < thirtyDaysAgo) {
      throw new ApiError(400, 'Refund period has expired (30 days)');
    }

    // Process refund through Stripe
    if (payment.stripePaymentIntentId) {
      await paymentService.createRefund(payment.stripePaymentIntentId, reason);
    }

    payment.status = 'refunded';
    payment.refundedAt = new Date();
    payment.refundReason = reason;
    await payment.save();

    res.json(
      new ApiResponse(200, { payment }, 'Refund processed successfully')
    );
  }),

  // Get payment methods
  getPaymentMethods: asyncHandler(async (req, res) => {
    const paymentMethods = await paymentService.getCustomerPaymentMethods(req.user.id);

    res.json(
      new ApiResponse(200, {
        paymentMethods
      }, 'Payment methods retrieved successfully')
    );
  }),

  // Add payment method
  addPaymentMethod: asyncHandler(async (req, res) => {
    const { paymentMethodId } = req.body;

    const paymentMethod = await paymentService.attachPaymentMethod(
      paymentMethodId,
      req.user.id
    );

    res.json(
      new ApiResponse(200, {
        paymentMethod
      }, 'Payment method added successfully')
    );
  }),

  // Remove payment method
  removePaymentMethod: asyncHandler(async (req, res) => {
    const { paymentMethodId } = req.params;

    await paymentService.detachPaymentMethod(paymentMethodId);

    res.json(
      new ApiResponse(200, null, 'Payment method removed successfully')
    );
  }),

  // Set default payment method
  setDefaultPaymentMethod: asyncHandler(async (req, res) => {
    const { paymentMethodId } = req.body;

    await paymentService.setDefaultPaymentMethod(req.user.id, paymentMethodId);

    res.json(
      new ApiResponse(200, null, 'Default payment method updated successfully')
    );
  })
};

module.exports = paymentController;