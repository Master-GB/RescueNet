import mongoose from "mongoose";

const citizenProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    phone: { type: String, required: true },
    address: {
        street: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        province: {
          type: String,
          required: true,
        },
      },
    location: { type: String, default: "" },

    emergencyContactName: { type: String, required: true },
    emergencyContactPhone: { type: String, required: true },

    // Optional (nice feature): citizen can save shelters
    savedShelters: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Shelter", default: [] },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("CitizenProfiles", citizenProfileSchema);
