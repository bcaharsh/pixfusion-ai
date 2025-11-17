const Joi = require('joi');

const userValidation = {
  updateProfile: {
    body: Joi.object({
      name: Joi.string()
        .min(2)
        .max(50)
        .messages({
          'string.min': 'Name must be at least 2 characters long',
          'string.max': 'Name cannot exceed 50 characters'
        }),
      phone: Joi.string()
        .pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
        .allow('', null)
        .messages({
          'string.pattern.base': 'Please provide a valid phone number'
        }),
      avatar: Joi.string()
        .uri()
        .allow('', null)
        .messages({
          'string.uri': 'Avatar must be a valid URL'
        }),
      bio: Joi.string()
        .max(500)
        .allow('', null)
        .messages({
          'string.max': 'Bio cannot exceed 500 characters'
        }),
      preferences: Joi.object({
        emailNotifications: Joi.boolean(),
        marketingEmails: Joi.boolean(),
        defaultImageStyle: Joi.string().allow('', null),
        privateByDefault: Joi.boolean()
      })
    }).min(1)
  },

  updateEmail: {
    body: Joi.object({
      newEmail: Joi.string()
        .email()
        .required()
        .lowercase()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'New email is required'
        }),
      password: Joi.string()
        .required()
        .messages({
          'any.required': 'Password is required to change email'
        })
    })
  },

  getUserById: {
    params: Joi.object({
      id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
          'string.pattern.base': 'Invalid user ID format',
          'any.required': 'User ID is required'
        })
    })
  },

  deleteAccount: {
    body: Joi.object({
      password: Joi.string()
        .required()
        .messages({
          'any.required': 'Password is required to delete account'
        }),
      confirmation: Joi.string()
        .valid('DELETE')
        .required()
        .messages({
          'any.only': 'Please type DELETE to confirm',
          'any.required': 'Confirmation is required'
        })
    })
  }
};

module.exports = userValidation;