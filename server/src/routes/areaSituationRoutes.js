import express from 'express';
import {
  getCurrentSituation,
  getSituationHistory,
  createSituation,
  updateSituation,
  deactivateSituation,
  getActiveSituations
} from '../controllers/areaSituationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
import { validateBody } from '../middleware/validate.js';
import { 
  createSituationSchema,
  updateSituationSchema
} from '../validators/areaSituationValidator.js';

const router = express.Router();

// Public routes - for citizens
router.get('/situation', getCurrentSituation);
router.get('/situation/history',protect,authorize("ADMIN"), getSituationHistory);
router.get('/situation/active', protect,getActiveSituations);
router.post('/situation', protect,authorize("ADMIN"),validateBody(createSituationSchema), createSituation);
router.put('/situation/:id',protect,authorize("ADMIN"), validateBody(updateSituationSchema), updateSituation);
router.delete('/situation/:id', protect,authorize("ADMIN"), deactivateSituation);

export default router;
