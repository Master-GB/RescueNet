import mongoose from "mongoose";

const ngoProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },

    // ===== USER-SIDE FIELDS (managed by NGO user) =====
    registrationNumber: { type: String, required: true },

    contactPhone: { type: String, required: true },
    serviceDistricts: [{ type: String, default: [] }],
    availabilityStatus: {
      type: String,
      enum: ["AVAILABLE", "BUSY", "OFFLINE"],
      default: "OFFLINE",
    },

    services: [{ type: String, default: [] }], // e.g., FOOD, MEDICAL, TRANSPORT

    // ===== ADMIN VERIFICATION =====
    // Boolean flag for quick checks (set by admin)
    verifiedByAdmin: { type: Boolean, default: false },

    // Full approval workflow managed by admin
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, // Admin who approved
    approvedAt: { type: Date },
    rejectionReason: { type: String },

    // ===== ADMIN-MANAGED NGO DETAILS =====
    organizationName: { type: String },
    type: {
      type: String,
      enum: ["food-bank", "medical", "shelter", "rescue", "relief", "other"],
    },
    contactPerson: { type: String },
    officialEmail: { type: String },
    alternatePhone: { type: String },
    address: {
      street: String,
      city: String,
      province: String,
      postalCode: String,
    },

    // ===== TASK MANAGEMENT =====
    // Requests assigned to this NGO by admin; NGO can accept or decline
    assignedRequests: [
      { type: mongoose.Schema.Types.ObjectId, ref: "HelpRequest", default: [] },
    ],
    // Requests the NGO has explicitly accepted from assignedRequests
    acceptedRequests: [
      { type: mongoose.Schema.Types.ObjectId, ref: "HelpRequest", default: [] },
    ],
    // Previously: acceptedTasks [{ ref: "Tasks" }] — renamed & split above; Tasks model removed

    // ===== PERFORMANCE TRACKING =====
    completedTasks: { type: Number, default: 0 },
    averageResponseTime: { type: Number }, // in minutes
    rating: { type: Number, default: 0, min: 0, max: 5 },

    // ===== DOCUMENTS =====
    documents: [
      {
        type: { type: String }, // e.g. "registration-certificate", "tax-id"
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    isActive: { type: Boolean, default: true },
    notes: { type: String }, // Admin notes
  },
  { timestamps: true }
);

// Indexes for faster admin queries
ngoProfileSchema.index({ approvalStatus: 1 });
ngoProfileSchema.index({ availabilityStatus: 1 });

export default mongoose.model("NgoProfiles", ngoProfileSchema);
