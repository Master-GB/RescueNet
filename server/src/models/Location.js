import mongoose from "mongoose";

const locationPointSchema = new mongoose.Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
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
    
    // Current/last known location
    currentLocation: {
      type: locationPointSchema,
      required: true,
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

// Index for geospatial queries (find nearby users)
locationSchema.index({
  "currentLocation.latitude": 1,
  "currentLocation.longitude": 1,
});

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

// Instance method to add location to history (keeps last 100 points)
locationSchema.methods.addLocationPoint = function (point) {
  this.currentLocation = point;
  this.locationHistory.push(point);
  this.lastActiveAt = new Date();
  this.lastSignalAt = new Date();
  this.isOnline = true;
  
  // Keep only last 100 location points
  if (this.locationHistory.length > 100) {
    this.locationHistory = this.locationHistory.slice(-100);
  }
  
  return this.save();
};

export default mongoose.model("Location", locationSchema);
