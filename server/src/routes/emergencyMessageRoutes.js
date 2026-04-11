import express from 'express';
import { getChatHistory } from '../controllers/emergencyMessageController.js';
// Typically we would import a protect/auth middleware if necessary
// import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/emergency/messages/:serviceType
router.get('/messages/:serviceType', getChatHistory);

export default router;
