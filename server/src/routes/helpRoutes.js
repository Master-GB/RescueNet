import express from "express";
import { createHelpRequest, getAllRequests } from "../controllers/HelpController.js";

const router = express.Router();

router.post("/", createHelpRequest);
router.get("/", getAllRequests);

export default router;
