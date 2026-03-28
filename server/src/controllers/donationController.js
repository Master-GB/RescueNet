import Donation from "../models/Donation.js";
import Campaign from "../models/Campaign.js";

export const submitDonation = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Proof image is required",
      });
    }

    const campaign = await Campaign.findById(req.body.campaignId);
    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Campaign not found" });
    }

    if (campaign.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "Cannot donate to a campaign that is not active",
      });
    }

    const donation = await Donation.create({
      campaignId: req.body.campaignId,
      donorId: req.user._id,
      donationType: req.body.donationType,
      declaredAmount: req.body.declaredAmount || 0,
      donorMessage: req.body.donorMessage || "",
      proofImageUrl: req.file.path,
    });

    return res.status(201).json({
      success: true,
      message: "Donation submitted successfully. Awaiting NGO verification.",
      donation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit donation",
      error: error.message,
    });
  }
};

export const getCampaignDonations = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);

    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Campaign not found" });
    }

    if (!campaign.ngoId.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only view donations for your own campaigns",
      });
    }

    const donations = await Donation.find({
      campaignId: req.params.campaignId,
    }).populate("donorId", "name email");

    return res.status(200).json({
      success: true,
      donations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch donations",
      error: error.message,
    });
  }
};

export const verifyDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId);

    if (!donation) {
      return res
        .status(404)
        .json({ success: false, message: "Donation not found" });
    }

    if (donation.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "This donation has already been processed",
      });
    }

    const campaign = await Campaign.findById(donation.campaignId);

    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Parent campaign not found" });
    }

    if (!campaign.ngoId.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only verify donations for your own campaigns",
      });
    }

    const { confirmedAmount, status } = req.body;

    donation.status = status;
    await donation.save();

    if (status === "Verified" && confirmedAmount > 0) {
      await Campaign.findByIdAndUpdate(donation.campaignId, {
        $inc: { raisedAmount: confirmedAmount },
      });
    }

    return res.status(200).json({
      success: true,
      message: `Donation ${status.toLowerCase()} successfully`,
      donation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to verify donation",
      error: error.message,
    });
  }
};
