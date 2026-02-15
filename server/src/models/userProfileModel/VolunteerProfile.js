import mongoose from "mongoose";

const volunteerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    phone: { type: String, required: true },
    skills: [{ type: String, default: [] }], // e.g., FIRST_AID, RESCUE, LOGISTICS
    serviceDistricts: [{ type: String, default: [] }],

    availabilityStatus: {
      type: String,
      enum: ["AVAILABLE", "BUSY", "OFFLINE"],
      default: "OFFLINE",
    },
    acceptedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tasks", default: [] }],

    verifiedByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("VolunteerProfiles", volunteerProfileSchema);
