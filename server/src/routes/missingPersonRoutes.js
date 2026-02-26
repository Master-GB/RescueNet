import express from 'express';
import missingPersonController from '../controllers/missingPersonController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
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

// Any logged-in user can create a report
router.post(
  '/',
  protect,
  createReportValidation,
  handleValidationErrors,
  missingPersonController.createReport
);

// Only admin or citizen can update
router.put(
  '/:id',
  protect,
  authorize('CITIZEN'),
  updateReportValidation,
  handleValidationErrors,
  missingPersonController.updateReport
);

router.patch(
  '/:id',
  protect,
  authorize('CITIZEN'),
  updateReportValidation,
  handleValidationErrors,
  missingPersonController.updateReport
);

// Only admin can delete
router.delete(
  '/:id',
  protect,
  authorize('CITIZEN'),
  getByIdValidation,
  handleValidationErrors,
  missingPersonController.deleteReport
);

// Any logged-in user can add a sighting
router.post(
  '/:id/sightings',
  protect,
  addSightingValidation,
  handleValidationErrors,
  missingPersonController.addSighting
);

export default router;