import express from "express";
import { createHelpRequest, getAllRequests } from "../controllers/helpController.js";

const router = express.Router();

router.post("/", createHelpRequest);
router.get("/", getAllRequests);

export default router;
