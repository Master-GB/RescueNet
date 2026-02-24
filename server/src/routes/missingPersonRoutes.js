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

// ==========================================
// SPECIFIC ROUTES FIRST (before /:id)
// ==========================================

router.get(
  '/statistics',
  missingPersonController.getStatistics
);

router.get(
  '/search-location',
  missingPersonController.searchByLocation
);


// ==========================================
// GENERAL ROUTES
// ==========================================

router.get(
  '/',
  queryValidation,
  handleValidationErrors,
  missingPersonController.getAllReports
);

// IMPORTANT: /:id must come AFTER specific routes
router.get(
  '/:id',
  getByIdValidation,
  handleValidationErrors,
  missingPersonController.getReportById
);

// ==========================================
// PROTECTED ROUTES
// ==========================================

router.post(
  '/',
  createReportValidation,
  handleValidationErrors,
  missingPersonController.createReport
);

router.put(
  '/:id',
  updateReportValidation,
  handleValidationErrors,
  missingPersonController.updateReport
);

router.patch(
  '/:id',
  updateReportValidation,
  handleValidationErrors,
  missingPersonController.updateReport
);

router.delete(
  '/:id',
  getByIdValidation,
  handleValidationErrors,
  missingPersonController.deleteReport
);

router.post(
  '/:id/sightings',
  addSightingValidation,
  handleValidationErrors,
  missingPersonController.addSighting
);

export default router;