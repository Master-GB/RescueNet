import express from "express";
import {
  createHelpRequest,
  getAllRequests,
  getHelpRequestById,
  updateHelpRequest,
  deleteHelpRequest,
} from "../controllers/HelpController.js";

const router = express.Router();

// Create new help request
router.post("/add", createHelpRequest);

// Get all help requests
router.get("/", getAllRequests);

// Get single help request by ID
router.get("/getid/:id", getHelpRequestById);

// Update help request
router.put("/update/:id", updateHelpRequest);

// Delete help request
router.delete("/delete/:id", deleteHelpRequest);

export default router;
