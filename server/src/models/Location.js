import mongoose from "mongoose";

// GeoJSON Point schema for geospatial queries
const geoPointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude] - GeoJSON format
      required: true,
    },
  },
  { _id: false }
);

// Extended location point with metadata
const locationPointSchema = new mongoose.Schema(
  {
    location: {
      type: geoPointSchema,
      required: true,
    },
    accuracy: { type: Number }, // GPS accuracy in meters
    altitude: { type: Number },
    speed: { type: Number }, // Speed in m/s
    heading: { type: Number }, // Direction in degrees
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    // Unique identifier for the user/device sharing location
    sessionId: { type: String, required: true, index: true },
    
    // Optional user info
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: { type: String },
    contactNumber: { type: String },
    
    // Current/last known location (GeoJSON Point for geospatial queries)
    currentLocation: {
      type: geoPointSchema,
      required: true,
      index: "2dsphere", // Enable geospatial queries
    },
    
    // Additional current location metadata
    currentLocationMeta: {
      accuracy: Number,
      altitude: Number,
      speed: Number,
      heading: Number,
      timestamp: { type: Date, default: Date.now },
    },
    
    // Location history (stores recent points for tracking path)
    locationHistory: {
      type: [locationPointSchema],
      default: [],
    },
    
    // Emergency status
    isEmergency: { type: Boolean, default: false },
    emergencyType: {
      type: String,
      enum: ["flood", "tsunami", "landslide", "cyclone", "medical", "fire", "other"],
    },
    emergencyMessage: { type: String },
    
    // Sharing status
    isSharing: { type: Boolean, default: true },
    sharingStartedAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
    
    // Connection status (to detect signal loss)
    isOnline: { type: Boolean, default: true },
    lastSignalAt: { type: Date, default: Date.now },
    
    // Link to help request if created from emergency
    helpRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "HelpRequest" },
  },
  { timestamps: true }
);

// 2dsphere index for geospatial queries (find nearby users)
locationSchema.index({ currentLocation: "2dsphere" });

// TTL index - auto-delete inactive sessions after 24 hours
locationSchema.index(
  { lastActiveAt: 1 },
  { expireAfterSeconds: 86400 } // 24 hours
);

// Static method to find active sharing sessions
locationSchema.statics.findActiveSessions = function () {
  return this.find({ isSharing: true, isOnline: true });
};

// Static method to find emergency sessions
locationSchema.statics.findEmergencySessions = function () {
  return this.find({ isSharing: true, isEmergency: true });
};

/**
 * Find users within a certain distance
 * @param {number} longitude - Center point longitude
 * @param {number} latitude - Center point latitude
 * @param {number} maxDistanceMeters - Maximum distance in meters (default: 10km)
 * @param {object} additionalFilters - Additional query filters
 */
locationSchema.statics.findNearby = function (
  longitude,
  latitude,
  maxDistanceMeters = 10000,
  additionalFilters = {}
) {
  return this.find({
    currentLocation: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistanceMeters,
      },
    },
    ...additionalFilters,
  });
};

/**
 * Find emergency users within a certain distance
 * @param {number} longitude - Center point longitude
 * @param {number} latitude - Center point latitude
 * @param {number} maxDistanceMeters - Maximum distance in meters
 */
locationSchema.statics.findNearbyEmergencies = function (
  longitude,
  latitude,
  maxDistanceMeters = 10000
) {
  return this.findNearby(longitude, latitude, maxDistanceMeters, {
    isEmergency: true,
    isSharing: true,
  });
};

/**
 * Find active users within a certain distance
 * @param {number} longitude - Center point longitude
 * @param {number} latitude - Center point latitude
 * @param {number} maxDistanceMeters - Maximum distance in meters
 */
locationSchema.statics.findNearbyActive = function (
  longitude,
  latitude,
  maxDistanceMeters = 10000
) {
  return this.findNearby(longitude, latitude, maxDistanceMeters, {
    isSharing: true,
    isOnline: true,
  });
};

// Instance method to add location to history (keeps last 100 points)
locationSchema.methods.addLocationPoint = function (point) {
  // point: { latitude, longitude, accuracy, altitude, speed, heading }
  const geoPoint = {
    type: "Point",
    coordinates: [point.longitude, point.latitude], // GeoJSON: [lng, lat]
  };

  this.currentLocation = geoPoint;
  this.currentLocationMeta = {
    accuracy: point.accuracy,
    altitude: point.altitude,
    speed: point.speed,
    heading: point.heading,
    timestamp: new Date(),
  };

  this.locationHistory.push({
    location: geoPoint,
    accuracy: point.accuracy,
    altitude: point.altitude,
    speed: point.speed,
    heading: point.heading,
    timestamp: new Date(),
  });

  this.lastActiveAt = new Date();
  this.lastSignalAt = new Date();
  this.isOnline = true;
  
  // Keep only last 100 location points
  if (this.locationHistory.length > 100) {
    this.locationHistory = this.locationHistory.slice(-100);
  }
  
  return this.save();
};

// Virtual to get latitude/longitude in a friendly format
locationSchema.virtual("coordinates").get(function () {
  if (this.currentLocation && this.currentLocation.coordinates) {
    return {
      longitude: this.currentLocation.coordinates[0],
      latitude: this.currentLocation.coordinates[1],
    };
  }
  return null;
});

// Ensure virtuals are included in JSON output
locationSchema.set("toJSON", { virtuals: true });
locationSchema.set("toObject", { virtuals: true });

export default mongoose.model("Location", locationSchema);
