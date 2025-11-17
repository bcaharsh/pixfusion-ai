const Joi = require('joi');

const authValidation = {
  register: {
    body: Joi.object({
      name: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.min': 'Name must be at least 2 characters long',
          'string.max': 'Name cannot exceed 50 characters',
          'any.required': 'Name is required'
        }),
      email: Joi.string()
        .email()
        .required()
        .lowercase()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        }),
      password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
          'string.min': 'Password must be at least 8 characters long',
          'string.max': 'Password cannot exceed 128 characters',
          'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
          'any.required': 'Password is required'
        }),
      confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
          'any.only': 'Passwords do not match',
          'any.required': 'Confirm password is required'
        })
    })
  },

  login: {
    body: Joi.object({
      email: Joi.string()
        .email()
        .required()
        .lowercase()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        }),
      password: Joi.string()
        .required()
        .messages({
          'any.required': 'Password is required'
        })
    })
  },

  refreshToken: {
    body: Joi.object({
      refreshToken: Joi.string()
        .required()
        .messages({
          'any.required': 'Refresh token is required'
        })
    })
  },

  forgotPassword: {
    body: Joi.object({
      email: Joi.string()
        .email()
        .required()
        .lowercase()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        })
    })
  },

  resetPassword: {
    body: Joi.object({
      token: Joi.string()
        .required()
        .messages({
          'any.required': 'Reset token is required'
        }),
      password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
          'string.min': 'Password must be at least 8 characters long',
          'string.max': 'Password cannot exceed 128 characters',
          'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
          'any.required': 'Password is required'
        }),
      confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
          'any.only': 'Passwords do not match',
          'any.required': 'Confirm password is required'
        })
    })
  },

  changePassword: {
    body: Joi.object({
      currentPassword: Joi.string()
        .required()
        .messages({
          'any.required': 'Current password is required'
        }),
      newPassword: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
          'string.min': 'Password must be at least 8 characters long',
          'string.max': 'Password cannot exceed 128 characters',
          'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
          'any.required': 'New password is required'
        }),
      confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
          'any.only': 'Passwords do not match',
          'any.required': 'Confirm password is required'
        })
    })
  },

  verifyEmail: {
    body: Joi.object({
      token: Joi.string()
        .required()
        .messages({
          'any.required': 'Verification token is required'
        })
    })
  }
};

module.exports = authValidation;