import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    raisedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Cancelled"],
      default: "Active",
    },
    bankDetails: {
      accountName: { type: String },
      accountNumber: { type: String },
      bankName: { type: String },
      branchName: { type: String },
    },
    acceptedItems: {
      type: [String],
      default: [],
    },
    campaignImageUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

campaignSchema.index({ status: 1 });
campaignSchema.index({ ngoId: 1 });

export default mongoose.model("Campaign", campaignSchema);
