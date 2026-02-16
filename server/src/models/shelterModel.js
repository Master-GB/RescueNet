import mongoose from "mongoose";

const shelterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    shelterType: {
      type: String,
      enum: [
        "SCHOOL",
        "TEMPLE",
        "COMMUNITY_HALL",
        "STADIUM",
        "GOVERNMENT_BUILDING",
        "OTHER",
      ],
      default: "OTHER",
    },

    images: [
      {
        url: String,
        caption: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Who manages it (admin/volunteer) and which org (if any)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    managedBy: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
    ],

    // Address & contact
    address: {
      street: { type: String, default: "" },
      city: { type: String, required: true },
      province: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    contact: {
      phone: { type: String, required: true },
      email: { type: String, default: "" },
    },

    // GeoJSON point for map + nearby search
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
        validate: {
          validator: (v) => Array.isArray(v) && v.length === 2,
          message: "coordinates must be [lng, lat]",
        },
      },
    },

    // Capacity
    capacity: {
      total: { type: Number, min: 1, required: true },
    },

    occupancy: {
      current: { type: Number, default: 0 },
      lastUpdatedAt: { type: Date, default: Date.now },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },

    // Features (filters)
    supports: {
      disasterTypes: {
        type: [String],
        enum:["FLOOD", "LANDSLIDE", "TSUNAMI", "FIRE", "CYCLONE", "OTHER"],
        required: true,
      },
      wheelchairAccess: { type: Boolean, default: false },
      medical: { type: Boolean, default: false },
      food: { type: Boolean, default: false },
      water: { type: Boolean, default: false },
      power: { type: Boolean, default: false },
    },

    specialSupport: {
      elderlySupport: { type: Boolean, default: false },
      disabilitySupport: { type: Boolean, default: false },
      pregnancySupport: { type: Boolean, default: false },
      childFriendly: { type: Boolean, default: false },
      petFriendly: { type: Boolean, default: false },
    },

    // Status
    status: {
      type: String,
      enum: ["OPEN", "FULL", "CLOSED"],
      default: "OPEN",
    },

    // Simple “verification” / trust
    verified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// 2️⃣ Virtual field
shelterSchema.virtual("capacity.available").get(function () {
  return this.capacity.total - this.occupancy.current;
});

// 3️⃣ Enable virtuals in JSON
shelterSchema.set("toJSON", { virtuals: true });
shelterSchema.set("toObject", { virtuals: true });

// ✅ Geo index for nearby queries
shelterSchema.index({ location: "2dsphere" });

// ✅ Useful text index for smart search
shelterSchema.index({
  name: "text",
  "address.city": "text",
  "address.province": "text",
});

export default mongoose.model("Shelter", shelterSchema);
