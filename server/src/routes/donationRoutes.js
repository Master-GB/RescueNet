import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorizeMiddleware.js";
import { validateBody } from "../middleware/validate.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  submitDonationSchema,
  verifyDonationSchema,
} from "../validators/campaign.schema.js";
import {
  submitDonation,
  getCampaignDonations,
  getDonationById,
  verifyDonation,
} from "../controllers/donationController.js";

const router = express.Router();

// Citizen / Volunteer — submit a donation with proof image
router.post(
  "/submit",
  protect,
  authorize("CITIZEN", "VOLUNTEER"),
  upload.single("proofImage"),
  validateBody(submitDonationSchema),
  submitDonation
);

// NGO — view all donations for one of their campaigns
router.get(
  "/campaign/:campaignId",
  protect,
  authorize("NGO"),
  getCampaignDonations
);

// NGO — view one donation by id if they own the parent campaign
router.get(
  "/:donationId",
  protect,
  authorize("NGO"),
  getDonationById
);

// NGO — verify or reject a donation
router.put(
  "/verify/:donationId",
  protect,
  authorize("NGO"),
  validateBody(verifyDonationSchema),
  verifyDonation
);

export default router;
