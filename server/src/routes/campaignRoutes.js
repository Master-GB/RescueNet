import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorizeMiddleware.js";
import { validateBody } from "../middleware/validate.js";
import { uploadCampaignImage } from "../middleware/uploadMiddleware.js";
import { normalizeCampaignBody } from "../middleware/normalizeCampaignBody.js";
import {
  createCampaignSchema,
  updateCampaignSchema,
} from "../validators/campaign.schema.js";
import {
  createCampaign,
  updateCampaign,
  getAllActiveCampaigns,
  getCampaignById,
} from "../controllers/campaignController.js";

const router = express.Router();

// Public
router.get("/active", getAllActiveCampaigns);
router.get("/:id", getCampaignById);

// NGO only
router.post(
  "/create",
  protect,
  authorize("NGO"),
  uploadCampaignImage.single("campaignImage"),
  normalizeCampaignBody,
  validateBody(createCampaignSchema),
  createCampaign
);

router.put(
  "/update/:id",
  protect,
  authorize("NGO"),
  uploadCampaignImage.single("campaignImage"),
  normalizeCampaignBody,
  validateBody(updateCampaignSchema),
  updateCampaign
);

export default router;
