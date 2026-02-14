import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorizeMiddleware.js";
import {
  updateHelpRequest,
  assignHelpRequest,
  rejectHelpRequest,
  verifyHelpRequest,
  resolveHelpRequest,
  getAdminHelpRequests,
  getAdminHelpRequestById,
} from "../controllers/adminHelpController.js";

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize("ADMIN"));

// Get all help requests with filtering (admin view)
router.get("/", getAdminHelpRequests);

// Get single help request with full details
router.get("/:id", getAdminHelpRequestById);

// Update help request (general update for any admin fields)
router.patch("/:id", updateHelpRequest);

// Specific action routes
router.post("/:id/assign", assignHelpRequest);
router.post("/:id/reject", rejectHelpRequest);
router.post("/:id/verify", verifyHelpRequest);
router.post("/:id/resolve", resolveHelpRequest);

export default router;
