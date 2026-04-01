import Joi from 'joi';

// Create situation validation schema
export const createSituationSchema = Joi.object({
  status: Joi.string()
    .valid('safe', 'warning', 'danger', 'monitor')
    .required()
    .messages({
      'string.only': 'Status must be one of: safe, warning, danger, monitor',
      'any.required': 'Status is required'
    }),
  
  title: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Title must be at least 1 character long',
      'string.max': 'Title cannot exceed 100 characters',
      'any.required': 'Title is required'
    }),
  
  message: Joi.string()
    .min(1)
    .max(500)
    .required()
    .messages({
      'string.min': 'Message must be at least 1 character long',
      'string.max': 'Message cannot exceed 500 characters',
      'any.required': 'Message is required'
    }),
  
  severity: Joi.string()
    .valid('low', 'medium', 'high')
    .required()
    .messages({
      'string.only': 'Severity must be one of: low, medium, high',
      'any.required': 'Severity is required'
    }),
  
  authority: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Authority must be at least 1 character long',
      'string.max': 'Authority cannot exceed 100 characters',
      'any.required': 'Authority is required'
    }),
  
  affectedAreas: Joi.array()
    .items(
      Joi.string()
        .max(100)
        .messages({
          'string.max': 'Each affected area cannot exceed 100 characters'
        })
    )
    .optional()
    .messages({
      'array.base': 'Affected areas must be an array'
    }),
  
  recommendedActions: Joi.array()
    .items(
      Joi.string()
        .max(200)
        .messages({
          'string.max': 'Each recommended action cannot exceed 200 characters'
        })
    )
    .optional()
    .messages({
      'array.base': 'Recommended actions must be an array'
    }),
  
  emergencyInstructions: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Emergency instructions cannot exceed 1000 characters'
    }),
  
  region: Joi.string()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Region cannot exceed 100 characters'
    }),
  
  validFrom: Joi.date()
    .optional()
    .messages({
      'date.base': 'Valid from must be a valid date'
    }),
  
  validUntil: Joi.date()
    .optional()
    .allow(null)
    .messages({
      'date.base': 'Valid until must be a valid date'
    })
});

// Update situation validation schema
export const updateSituationSchema = Joi.object({
  status: Joi.string()
    .valid('safe', 'warning', 'danger', 'monitor')
    .optional()
    .messages({
      'string.only': 'Status must be one of: safe, warning, danger, monitor'
    }),
  
  title: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Title must be at least 1 character long',
      'string.max': 'Title cannot exceed 100 characters'
    }),
  
  message: Joi.string()
    .min(1)
    .max(500)
    .optional()
    .messages({
      'string.min': 'Message must be at least 1 character long',
      'string.max': 'Message cannot exceed 500 characters'
    }),
  
  severity: Joi.string()
    .valid('low', 'medium', 'high')
    .optional()
    .messages({
      'string.only': 'Severity must be one of: low, medium, high'
    }),
  
  authority: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Authority must be at least 1 character long',
      'string.max': 'Authority cannot exceed 100 characters'
    }),
  
  affectedAreas: Joi.array()
    .items(
      Joi.string()
        .max(100)
        .messages({
          'string.max': 'Each affected area cannot exceed 100 characters'
        })
    )
    .optional()
    .messages({
      'array.base': 'Affected areas must be an array'
    }),
  
  recommendedActions: Joi.array()
    .items(
      Joi.string()
        .max(200)
        .messages({
          'string.max': 'Each recommended action cannot exceed 200 characters'
        })
    )
    .optional()
    .messages({
      'array.base': 'Recommended actions must be an array'
    }),
  
  emergencyInstructions: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Emergency instructions cannot exceed 1000 characters'
    }),
  
  region: Joi.string()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Region cannot exceed 100 characters'
    }),
  
  validFrom: Joi.date()
    .optional()
    .messages({
      'date.base': 'Valid from must be a valid date'
    }),
  
  validUntil: Joi.date()
    .optional()
    .allow(null)
    .messages({
      'date.base': 'Valid until must be a valid date'
    }),
  
  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Is active must be a boolean value'
    })
});

// Query parameter validation
export const getSituationQuerySchema = Joi.object({
  region: Joi.string()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Region parameter cannot exceed 100 characters'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    })
});

// ID parameter validation
export const idParamSchema = Joi.object({
  id: Joi.string()
    .required()
    .messages({
      'any.required': 'ID parameter is required',
      'string.base': 'ID must be a string'
    })
});
