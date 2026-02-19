import express from 'express';
import missingPersonController from '../controllers/missingPersonController.js';
import {
  createReportValidation,
  updateReportValidation,
  getByIdValidation,
  queryValidation,
  addSightingValidation,
  handleValidationErrors
} from '../validators/missingPersonValidator.js';

const router = express.Router();

// Note: Authentication middleware will be added later
// const { protect, authorize } = require('../middleware/auth');

// Public routes (anyone can view)
router.get(
  '/',
  queryValidation,
  handleValidationErrors,
  missingPersonController.getAllReports
);

router.get(
  '/statistics',
  missingPersonController.getStatistics
);

router.get(
  '/search-location',
  missingPersonController.searchByLocation
);

router.get(
  '/:id',
  getByIdValidation,
  handleValidationErrors,
  missingPersonController.getReportById
);

// Protected routes (requires authentication)
// For now, these are open - will add authentication later
router.post(
  '/',
  // protect, // Uncomment when auth is implemented
  createReportValidation,
  handleValidationErrors,
  missingPersonController.createReport
);

router.put(
  '/:id',
  // protect, // Uncomment when auth is implemented
  updateReportValidation,
  handleValidationErrors,
  missingPersonController.updateReport
);

router.patch(
  '/:id',
  // protect, // Uncomment when auth is implemented
  updateReportValidation,
  handleValidationErrors,
  missingPersonController.updateReport
);

router.delete(
  '/:id',
  // protect, // Uncomment when auth is implemented
  // authorize('admin', 'reporter'), // Uncomment when auth is implemented
  getByIdValidation,
  handleValidationErrors,
  missingPersonController.deleteReport
);

router.post(
  '/:id/sightings',
  // protect, // Uncomment when auth is implemented
  addSightingValidation,
  handleValidationErrors,
  missingPersonController.addSighting
);

export default router;