const Joi = require('joi');

const generationValidation = {
  createGeneration: {
    body: Joi.object({
      prompt: Joi.string()
        .min(3)
        .max(2000)
        .required()
        .messages({
          'string.min': 'Prompt must be at least 3 characters long',
          'string.max': 'Prompt cannot exceed 2000 characters',
          'any.required': 'Prompt is required'
        }),
      negativePrompt: Joi.string()
        .max(1000)
        .allow('', null)
        .messages({
          'string.max': 'Negative prompt cannot exceed 1000 characters'
        }),
      styleType: Joi.string()
        .valid('general', 'realistic', 'design', 'render_3d', 'anime')
        .default('general')
        .messages({
          'any.only': 'Style type must be one of: general, realistic, design, render_3d, anime'
        }),
      magicPromptOption: Joi.string()
        .valid('Auto', 'On', 'Off')
        .default('Auto')
        .messages({
          'any.only': 'Magic prompt option must be one of: Auto, On, Off'
        }),
      aspectRatio: Joi.string()
        .valid('1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3')
        .default('1:1')
        .messages({
          'any.only': 'Aspect ratio must be one of: 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3'
        }),
      seed: Joi.number()
        .integer()
        .min(0)
        .max(2147483647)
        .allow(null)
        .messages({
          'number.base': 'Seed must be a number',
          'number.min': 'Seed must be a positive number',
          'number.max': 'Seed must be less than 2147483647'
        }),
      isPublic: Joi.boolean()
        .default(false)
    })
  },

  getGeneration: {
    params: Joi.object({
      id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
          'string.pattern.base': 'Invalid generation ID format',
          'any.required': 'Generation ID is required'
        })
    })
  },

  listGenerations: {
    query: Joi.object({
      page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
          'number.min': 'Page must be at least 1'
        }),
      limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20)
        .messages({
          'number.min': 'Limit must be at least 1',
          'number.max': 'Limit cannot exceed 100'
        }),
      status: Joi.string()
        .valid('pending', 'processing', 'completed', 'failed')
        .messages({
          'any.only': 'Status must be one of: pending, processing, completed, failed'
        }),
      sortBy: Joi.string()
        .valid('createdAt', 'updatedAt', 'prompt')
        .default('createdAt'),
      sortOrder: Joi.string()
        .valid('asc', 'desc')
        .default('desc'),
      search: Joi.string()
        .max(100)
        .allow('')
    })
  },

  deleteGeneration: {
    params: Joi.object({
      id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
          'string.pattern.base': 'Invalid generation ID format',
          'any.required': 'Generation ID is required'
        })
    })
  },

  updateGeneration: {
    params: Joi.object({
      id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
    }),
    body: Joi.object({
      isPublic: Joi.boolean(),
      isFavorite: Joi.boolean()
    }).min(1)
  },

  batchDelete: {
    body: Joi.object({
      generationIds: Joi.array()
        .items(
          Joi.string().pattern(/^[0-9a-fA-F]{24}$/)
        )
        .min(1)
        .max(50)
        .required()
        .messages({
          'array.min': 'At least one generation ID is required',
          'array.max': 'Cannot delete more than 50 generations at once',
          'any.required': 'Generation IDs are required'
        })
    })
  }
};

module.exports = generationValidation;