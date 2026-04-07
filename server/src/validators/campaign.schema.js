import Joi from "joi";

export const createCampaignSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().trim().min(10).max(2000).required(),
  targetAmount: Joi.number().positive().required(),
  bankDetails: Joi.object({
    accountName: Joi.string().trim().required(),
    accountNumber: Joi.string().trim().required(),
    bankName: Joi.string().trim().required(),
    branchName: Joi.string().trim().required(),
  }).required(),
  acceptedItems: Joi.array().items(Joi.string().trim()).optional(),
});

export const updateCampaignSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional(),
  description: Joi.string().trim().min(10).max(2000).optional(),
  targetAmount: Joi.number().positive().optional(),
  status: Joi.string().valid("Active", "Completed", "Cancelled").optional(),
  bankDetails: Joi.object({
    accountName: Joi.string().trim().required(),
    accountNumber: Joi.string().trim().required(),
    bankName: Joi.string().trim().required(),
    branchName: Joi.string().trim().required(),
  }).optional(),
  acceptedItems: Joi.array().items(Joi.string().trim()).optional(),
});

export const submitDonationSchema = Joi.object({
  campaignId: Joi.string().required(),
  donationType: Joi.string().valid("Money", "Supplies").required(),
  declaredAmount: Joi.number().min(0).default(0),
  donorMessage: Joi.string().trim().max(500).allow("").optional(),
});

export const verifyDonationSchema = Joi.object({
  confirmedAmount: Joi.number().min(0).required(),
  status: Joi.string().valid("Verified", "Rejected").required(),
});
