const Joi = require('joi');

const subscriptionValidation = {
  subscribe: {
    body: Joi.object({
      planId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
          'string.pattern.base': 'Invalid plan ID format',
          'any.required': 'Plan ID is required'
        }),
      paymentMethodId: Joi.string()
        .required()
        .messages({
          'any.required': 'Payment method is required'
        }),
      billingCycle: Joi.string()
        .valid('monthly', 'yearly')
        .default('monthly')
        .messages({
          'any.only': 'Billing cycle must be either monthly or yearly'
        }),
      autoRenew: Joi.boolean()
        .default(true)
    })
  },

  updateSubscription: {
    params: Joi.object({
      id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
    }),
    body: Joi.object({
      planId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/),
      autoRenew: Joi.boolean(),
      paymentMethodId: Joi.string()
    }).min(1)
  },

  cancelSubscription: {
    body: Joi.object({
      reason: Joi.string()
        .max(500)
        .allow('', null)
        .messages({
          'string.max': 'Reason cannot exceed 500 characters'
        }),
      feedback: Joi.string()
        .max(1000)
        .allow('', null)
        .messages({
          'string.max': 'Feedback cannot exceed 1000 characters'
        }),
      cancelImmediately: Joi.boolean()
        .default(false)
    })
  },

  reactivateSubscription: {
    params: Joi.object({
      id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
    })
  },

  getPlanById: {
    params: Joi.object({
      id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
          'string.pattern.base': 'Invalid plan ID format',
          'any.required': 'Plan ID is required'
        })
    })
  },

  changePlan: {
    body: Joi.object({
      newPlanId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
          'string.pattern.base': 'Invalid plan ID format',
          'any.required': 'New plan ID is required'
        }),
      upgradeImmediately: Joi.boolean()
        .default(true)
    })
  }
};

module.exports = subscriptionValidation;