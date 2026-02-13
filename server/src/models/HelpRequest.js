import mongoose from "mongoose";

const helpRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    // New fields
    contactNumber: { type: String, required: true },
    realLocation: { type: String, required: true },
    disasterType: {
      type: String,
      enum: ["flood", "tsunami", "landslide", "cyclone", "other"],
      required: true,
    },
    message: { type: String, required: true },
    urgency: { type: String, enum: ["low", "medium", "high"], default: "low" },
    weatherCondition: String,
    // Optional voice message stored directly in DB (no multer)
    voiceMessage: {
      data: Buffer,
      mimeType: String,
      size: Number,
    },
    // Optional images stored directly in DB (no multer)
    images: [
      {
        data: Buffer,
        mimeType: String,
        size: Number,
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.model("HelpRequest", helpRequestSchema);
