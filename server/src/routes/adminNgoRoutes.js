import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorizeMiddleware.js";
import {
	registerNgo,
	getAllNgos,
	updateNgo,
    getNgoById,
	deleteNgo,
} from "../controllers/adminNgoController.js";

const router = express.Router();

// Protect all routes: Authentication + Admin Role required
router.use(protect);
router.use(authorize("ADMIN"));

// Get all NGO profiles (admin)
router.get("/", getAllNgos);

// Register a new NGO — must be before /:id to avoid route conflict
router.post("/register", registerNgo);

// Single NGO operations
router.get("/:id", getNgoById);
router.patch("/:id", updateNgo);
router.delete("/:id", deleteNgo);

export default router;