import { body, param, query, validationResult } from 'express-validator';

// Validation rules for creating a missing person report
const createReportValidation = [
  body('reporterName')
    .trim()
    .notEmpty().withMessage('Reporter name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Reporter name must be between 2 and 100 characters'),

  body('reporterContact.phone')
    .trim()
    .notEmpty().withMessage('Reporter phone is required')
    .matches(/^[0-9]{10}$/).withMessage('Phone must be a valid 10-digit number'),

  body('reporterContact.email')
    .trim()
    .notEmpty().withMessage('Reporter email is required')
    .isEmail().withMessage('Please provide a valid email'),

  body('fullName')
    .trim()
    .notEmpty().withMessage('Missing person name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('age')
    .notEmpty().withMessage('Age is required')
    .isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150'),

  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),

  body('lastSeenLocation.address')
    .trim()
    .notEmpty().withMessage('Last seen address is required'),

  body('lastSeenLocation.city')
    .trim()
    .notEmpty().withMessage('City is required'),

  body('lastSeenLocation.coordinates.coordinates')
    .isArray({ min: 2, max: 2 }).withMessage('Coordinates must be an array of [longitude, latitude]')
    .custom((value) => {
      const [lng, lat] = value;
      if (lng < -180 || lng > 180) throw new Error('Longitude must be between -180 and 180');
      if (lat < -90 || lat > 90) throw new Error('Latitude must be between -90 and 90');
      return true;
    }),

  body('lastSeenDate')
    .notEmpty().withMessage('Last seen date is required')
    .isISO8601().withMessage('Please provide a valid date')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('Last seen date cannot be in the future');
      }
      return true;
    }),

  body('circumstances')
    .trim()
    .notEmpty().withMessage('Circumstances are required')
    .isLength({ max: 1000 }).withMessage('Circumstances cannot exceed 1000 characters'),

  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority level')
];

// Validation rules for updating a report
const updateReportValidation = [
  param('id')
    .isMongoId().withMessage('Invalid report ID'),

  body('status')
    .optional()
    .isIn(['Active', 'Found', 'Closed']).withMessage('Invalid status'),

  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority'),

  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('age')
    .optional()
    .isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150')
];

// Validation for getting report by ID
const getByIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid report ID')
];

// Validation for query parameters
const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(['Active', 'Found', 'Closed']).withMessage('Invalid status'),

  query('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority')
];

// Validation for adding sighting
const addSightingValidation = [
  param('id')
    .isMongoId().withMessage('Invalid report ID'),

  body('reportedBy')
    .trim()
    .notEmpty().withMessage('Reporter name is required'),

  body('location')
    .trim()
    .notEmpty().withMessage('Sighting location is required'),

  body('dateTime')
    .notEmpty().withMessage('Sighting date/time is required')
    .isISO8601().withMessage('Please provide a valid date'),

  body('description')
    .trim()
    .notEmpty().withMessage('Sighting description is required')
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

export {
  createReportValidation,
  updateReportValidation,
  getByIdValidation,
  queryValidation,
  addSightingValidation,
  handleValidationErrors
};