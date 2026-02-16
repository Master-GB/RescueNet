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

// ✅ Get single NGO by ID
router.get("/:id", getNgoById);

// Update NGO profile details (admin)
router.patch("/:id", updateNgo);

// Delete NGO profile (admin)
router.delete("/:id", deleteNgo);

// Register a new NGO
router.post("/register", registerNgo);

export default router;