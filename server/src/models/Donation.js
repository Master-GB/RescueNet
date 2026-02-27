import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    donationType: {
      type: String,
      enum: ["Money", "Supplies"],
      required: true,
    },
    declaredAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    donorMessage: {
      type: String,
      default: "",
    },
    proofImageUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

donationSchema.index({ campaignId: 1, status: 1 });

export default mongoose.model("Donation", donationSchema);
