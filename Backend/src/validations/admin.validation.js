const Joi = require('joi');

const adminValidation = {
  createPlan: {
    body: Joi.object({
      name: Joi.string()
        .min(2)
        .max(50)
        .required(),
      displayName: Joi.string()
        .min(2)
        .max(50)
        .required(),
      description: Joi.string()
        .max(500)
        .required(),
      price: Joi.number()
        .min(0)
        .required(),
      currency: Joi.string()
        .valid('USD', 'EUR', 'GBP')
        .default('USD'),
      billingCycle: Joi.string()
        .valid('monthly', 'yearly')
        .required(),
      credits: Joi.number()
        .integer()
        .min(0)
        .required(),
      imageLimit: Joi.number()
        .integer()
        .min(0)
        .required(),
      features: Joi.array()
        .items(Joi.string())
        .min(1)
        .required(),
      stripePriceId: Joi.string()
        .allow('', null),
      isActive: Joi.boolean()
        .default(true),
      priority: Joi.number()
        .integer()
        .min(1)
        .default(1)
    })
  },

  updatePlan: {
    params: Joi.object({
      id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
    }),
    body: Joi.object({
      name: Joi.string()
        .min(2)
        .max(50),
      displayName: Joi.string()
        .min(2)
        .max(50),
      description: Joi.string()
        .max(500),
      price: Joi.number()
        .min(0),
      credits: Joi.number()
        .integer()
        .min(0),
      imageLimit: Joi.number()
        .integer()
        .min(0),
      features: Joi.array()
        .items(Joi.string())
        .min(1),
      isActive: Joi.boolean(),
      priority: Joi.number()
        .integer()
        .min(1)
    }).min(1)
  },

  updateUser: {
    params: Joi.object({
      id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
    }),
    body: Joi.object({
      isActive: Joi.boolean(),
      imagesRemaining: Joi.number()
        .integer()
        .min(0),
      role: Joi.string()
        .valid('user', 'premium', 'admin'),
      notes: Joi.string()
        .max(1000)
    }).min(1)
  },

  listUsers: {
    query: Joi.object({
      page: Joi.number()
        .integer()
        .min(1)
        .default(1),
      limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20),
      search: Joi.string()
        .max(100)
        .allow(''),
      status: Joi.string()
        .valid('active', 'inactive', 'suspended'),
      sortBy: Joi.string()
        .valid('createdAt', 'name', 'email', 'imagesGenerated')
        .default('createdAt'),
      sortOrder: Joi.string()
        .valid('asc', 'desc')
        .default('desc')
    })
  },

  listGenerations: {
    query: Joi.object({
      page: Joi.number()
        .integer()
        .min(1)
        .default(1),
      limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20),
      userId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/),
      status: Joi.string()
        .valid('pending', 'processing', 'completed', 'failed'),
      startDate: Joi.date(),
      endDate: Joi.date(),
      sortBy: Joi.string()
        .valid('createdAt', 'status')
        .default('createdAt'),
      sortOrder: Joi.string()
        .valid('asc', 'desc')
        .default('desc')
    })
  },

  deleteUser: {
    params: Joi.object({
      id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
    })
  },

  getStatistics: {
    query: Joi.object({
      period: Joi.string()
        .valid('today', 'week', 'month', 'year', 'all')
        .default('month')
    })
  },

  createAdmin: {
    body: Joi.object({
      name: Joi.string()
        .min(2)
        .max(50)
        .required(),
      email: Joi.string()
        .email()
        .required()
        .lowercase(),
      password: Joi.string()
        .min(8)
        .required(),
      role: Joi.string()
        .valid('admin', 'superadmin')  // ✅ Changed from super_admin
        .default('admin'),
      permissions: Joi.array()
        .items(Joi.string().valid('all', 'users', 'subscriptions', 'payments', 'generations', 'plans', 'settings', 'analytics'))  // ✅ Added 'all'
        .default([])
    })
  }
};

module.exports = adminValidation;