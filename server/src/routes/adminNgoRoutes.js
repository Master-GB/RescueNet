import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorizeMiddleware.js";
import { registerNgo } from "../controllers/adminNgoController.js";

const router = express.Router();

// Protect all routes: Authentication + Admin Role required
router.use(protect);
router.use(authorize("ADMIN"));

// Register a new NGO
router.post("/register", registerNgo);

export default router;