import Campaign from "../models/Campaign.js";

const CAMPAIGN_STATUSES = ["Active", "Completed", "Cancelled"];

export const createCampaign = async (req, res) => {
  try {
    const campaignPayload = {
      ...req.body,
      ngoId: req.user._id,
    };

    if (req.file?.path) {
      campaignPayload.campaignImageUrl = req.file.path;
    }

    const campaign = await Campaign.create(campaignPayload);

    return res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      campaign,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create campaign",
      error: error.message,
    });
  }
};

export const updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Campaign not found" });
    }

    if (!campaign.ngoId.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own campaigns",
      });
    }

    Object.assign(campaign, req.body);

    if (req.file?.path) {
      campaign.campaignImageUrl = req.file.path;
    }

    await campaign.save();

    return res.status(200).json({
      success: true,
      message: "Campaign updated successfully",
      campaign,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update campaign",
      error: error.message,
    });
  }
};

export const getAllActiveCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: "Active" }).populate(
      "ngoId",
      "name email"
    );

    return res.status(200).json({
      success: true,
      campaigns,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch campaigns",
      error: error.message,
    });
  }
};

export const getMyCampaigns = async (req, res) => {
  try {
    const filter = { ngoId: req.user._id };
    const status = req.query?.status;

    if (status && CAMPAIGN_STATUSES.includes(status)) {
      filter.status = status;
    }

    const campaigns = await Campaign.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      campaigns,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch NGO campaigns",
      error: error.message,
    });
  }
};

export const cancelCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Campaign not found" });
    }

    if (!campaign.ngoId.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own campaigns",
      });
    }

    campaign.status = "Cancelled";
    await campaign.save();

    return res.status(200).json({
      success: true,
      message: "Campaign cancelled successfully",
      campaign,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to cancel campaign",
      error: error.message,
    });
  }
};

export const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate(
      "ngoId",
      "name email"
    );

    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Campaign not found" });
    }

    return res.status(200).json({
      success: true,
      campaign,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch campaign",
      error: error.message,
    });
  }
};
