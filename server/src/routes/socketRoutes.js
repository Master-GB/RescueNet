import express from 'express';
import socketController from '../controllers/socketController.js';

const router = express.Router();

// Get Socket.IO status
router.get(
  '/status',
  socketController.getStatus
);

// Test broadcast to all clients
router.post(
  '/test-broadcast',
  socketController.testBroadcast
);

export default router;