import mongoose from "mongoose";

const helpRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
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
    translatedMessage: { type: String },
    urgency: { type: String, enum: ["low", "medium", "high"], default: "low" },
    weatherCondition: String,
    // Optional voice message stored directly in DB (no multer)
    voiceMessage: {
      data: Buffer,
      mimeType: String,
      size: Number,
    },
    voiceTranscription: { type: String },
    // Optional images stored directly in DB (no multer)
    images: [
      {
        data: Buffer,
        mimeType: String,
        size: Number,
      }
    ],
    imageLabels: [{ type: String }],

  // ===== NEW FIELDS FOR TASK MANAGEMENT DONE BY ADMIN =====
    status: {
      type: String,
      enum: ["pending", "verified", "assigned", "in-progress", "resolved", "rejected"],
      default: "pending"
    },
    assignments: [
      {
        ngoId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "NgoProfiles",
          required: true,
        },
        taskType: { type: String, default: "General Relief" },
        status: {
          type: String,
          enum: ["assigned", "accepted", "declined", "in-progress", "completed"],
          default: "assigned",
        },
        declineReason: { type: String },
        assignedAt: { type: Date, default: Date.now },
        completedAt: { type: Date },
      },
    ],
    adminNotes: { type: String },
    rejectionReason: { type: String },
    resolvedAt: { type: Date },
    publishedToSocial: { type: Boolean, default: false }
  },

  { timestamps: true }
);

// Index for faster queries
helpRequestSchema.index({ userId: 1 });
helpRequestSchema.index({ status: 1 });
helpRequestSchema.index({ "assignments.ngoId": 1 });
helpRequestSchema.index({ disasterType: 1 });
helpRequestSchema.index({ urgency: 1 });

export default mongoose.model("HelpRequest", helpRequestSchema);
