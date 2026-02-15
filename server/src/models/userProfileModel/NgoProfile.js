import mongoose from "mongoose";

const ngoProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    registrationNumber: { type: String, required: true},

    contactPhone: { type: String, required: true },
    serviceDistricts:  [{ type: String, default: [] }],
    availabilityStatus: {
      type: String,
      enum: ["AVAILABLE", "BUSY", "OFFLINE"],
      default: "OFFLINE",
    },

    services: [{ type: String, default: [] }], // e.g., FOOD, MEDICAL, TRANSPORT
    verifiedByAdmin: { type: Boolean, default: false },
    acceptedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tasks", default: [] }],
  },
  { timestamps: true }
);

export default mongoose.model("NgoProfiles", ngoProfileSchema);
