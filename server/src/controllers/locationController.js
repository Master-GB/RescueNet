import Location from "../models/Location.js";
import crypto from "crypto";

/**
 * Generate a unique session ID for location sharing
 */
const generateSessionId = () => crypto.randomUUID();

/**
 * Helper to create GeoJSON point from lat/lng
 */
const createGeoPoint = (longitude, latitude) => ({
  type: "Point",
  coordinates: [longitude, latitude], // GeoJSON format: [lng, lat]
});

/**
 * Helper to format location response with friendly coordinates
 */
const formatLocationResponse = (location) => {
  const coords = location.currentLocation?.coordinates || [];
  return {
    ...location.toObject(),
    // Add friendly coordinate format
    latitude: coords[1],
    longitude: coords[0],
  };
};

/**
 * Start sharing location - creates a new location session
 * POST /api/location/start
 */
export const startSharing = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      accuracy,
      altitude,
      speed,
      heading,
      userName,
      contactNumber,
      isEmergency,
      emergencyType,
      emergencyMessage,
      helpRequestId,
    } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    const sessionId = generateSessionId();
    const geoPoint = createGeoPoint(longitude, latitude);
    const timestamp = new Date();

    const location = await Location.create({
      sessionId,
      userName,
      contactNumber,
      currentLocation: geoPoint,
      currentLocationMeta: {
        accuracy,
        altitude,
        speed,
        heading,
        timestamp,
      },
      locationHistory: [{
        location: geoPoint,
        accuracy,
        altitude,
        speed,
        heading,
        timestamp,
      }],
      isEmergency: isEmergency || false,
      emergencyType,
      emergencyMessage,
      helpRequestId,
      isSharing: true,
      isOnline: true,
    });

    res.status(201).json({
      success: true,
      sessionId,
      location: formatLocationResponse(location),
      message: isEmergency
        ? "Emergency location sharing started"
        : "Location sharing started",
    });
  } catch (error) {
    console.error("Error starting location sharing:", error);
    res.status(500).json({ error: "Failed to start location sharing" });
  }
};

/**
 * Update location - updates current position and adds to history
 * PUT /api/location/:sessionId
 */
export const updateLocation = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { latitude, longitude, accuracy, altitude, speed, heading } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    const location = await Location.findOne({ sessionId, isSharing: true });
    if (!location) {
      return res.status(404).json({ error: "Location session not found or stopped" });
    }

    const locationPoint = {
      latitude,
      longitude,
      accuracy,
      altitude,
      speed,
      heading,
      timestamp: new Date(),
    };

    await location.addLocationPoint(locationPoint);

    res.json({
      success: true,
      currentLocation: location.currentLocation,
      message: "Location updated",
    });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ error: "Failed to update location" });
  }
};

/**
 * Stop sharing location
 * PUT /api/location/:sessionId/stop
 */
export const stopSharing = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const location = await Location.findOneAndUpdate(
      { sessionId },
      { isSharing: false, isOnline: false },
      { new: true }
    );

    if (!location) {
      return res.status(404).json({ error: "Location session not found" });
    }

    res.json({
      success: true,
      message: "Location sharing stopped",
      lastLocation: location.currentLocation,
    });
  } catch (error) {
    console.error("Error stopping location sharing:", error);
    res.status(500).json({ error: "Failed to stop location sharing" });
  }
};

/**
 * Get location by session ID (includes last known location if offline)
 * GET /api/location/:sessionId
 */
export const getLocation = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const location = await Location.findOne({ sessionId });
    if (!location) {
      return res.status(404).json({ error: "Location session not found" });
    }

    // Check if user went offline (no update in last 30 seconds)
    const thirtySecondsAgo = new Date(Date.now() - 30000);
    const isCurrentlyOnline = location.lastSignalAt > thirtySecondsAgo;

    if (location.isOnline !== isCurrentlyOnline) {
      location.isOnline = isCurrentlyOnline;
      await location.save();
    }

    res.json({
      success: true,
      location,
      isLive: isCurrentlyOnline && location.isSharing,
      lastKnownLocation: location.currentLocation,
      signalStatus: isCurrentlyOnline ? "online" : "offline",
      message: isCurrentlyOnline
        ? "Live location"
        : "Last known location (signal lost)",
    });
  } catch (error) {
    console.error("Error getting location:", error);
    res.status(500).json({ error: "Failed to get location" });
  }
};

/**
 * Get location history for a session
 * GET /api/location/:sessionId/history
 */
export const getLocationHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50 } = req.query;

    const location = await Location.findOne({ sessionId });
    if (!location) {
      return res.status(404).json({ error: "Location session not found" });
    }

    const history = location.locationHistory.slice(-parseInt(limit));

    res.json({
      success: true,
      sessionId,
      history,
      totalPoints: location.locationHistory.length,
      startedAt: location.sharingStartedAt,
      lastActiveAt: location.lastActiveAt,
    });
  } catch (error) {
    console.error("Error getting location history:", error);
    res.status(500).json({ error: "Failed to get location history" });
  }
};

/**
 * Get all active sharing sessions (for responders/admins)
 * GET /api/location/active
 */
export const getActiveSessions = async (req, res) => {
  try {
    const { emergencyOnly } = req.query;

    let query = { isSharing: true };
    if (emergencyOnly === "true") {
      query.isEmergency = true;
    }

    const locations = await Location.find(query)
      .select("-locationHistory")
      .sort({ lastActiveAt: -1 });

    // Update online status for each location
    const thirtySecondsAgo = new Date(Date.now() - 30000);
    const sessionsWithStatus = locations.map((loc) => ({
      ...loc.toObject(),
      isOnline: loc.lastSignalAt > thirtySecondsAgo,
    }));

    res.json({
      success: true,
      count: sessionsWithStatus.length,
      sessions: sessionsWithStatus,
    });
  } catch (error) {
    console.error("Error getting active sessions:", error);
    res.status(500).json({ error: "Failed to get active sessions" });
  }
};

/**
 * Activate emergency mode for existing session
 * PUT /api/location/:sessionId/emergency
 */
export const activateEmergency = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { emergencyType, emergencyMessage } = req.body;

    const location = await Location.findOneAndUpdate(
      { sessionId },
      {
        isEmergency: true,
        emergencyType: emergencyType || "other",
        emergencyMessage,
      },
      { new: true }
    );

    if (!location) {
      return res.status(404).json({ error: "Location session not found" });
    }

    res.json({
      success: true,
      message: "Emergency mode activated",
      location,
    });
  } catch (error) {
    console.error("Error activating emergency:", error);
    res.status(500).json({ error: "Failed to activate emergency mode" });
  }
};

/**
 * Deactivate emergency mode
 * PUT /api/location/:sessionId/safe
 */
export const markSafe = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const location = await Location.findOneAndUpdate(
      { sessionId },
      { isEmergency: false },
      { new: true }
    );

    if (!location) {
      return res.status(404).json({ error: "Location session not found" });
    }

    res.json({
      success: true,
      message: "Marked as safe",
      location,
    });
  } catch (error) {
    console.error("Error marking safe:", error);
    res.status(500).json({ error: "Failed to mark as safe" });
  }
};

/**
 * Find nearby users sharing location
 * GET /api/location/nearby
 * @query latitude - Center point latitude (required)
 * @query longitude - Center point longitude (required)
 * @query radius - Search radius in meters (default: 10000 = 10km)
 * @query emergencyOnly - Only return emergency sessions (default: false)
 */
export const findNearby = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10000, emergencyOnly } = req.query;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const maxDistance = parseInt(radius);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: "Invalid coordinates" });
    }

    let locations;
    if (emergencyOnly === "true") {
      locations = await Location.findNearbyEmergencies(lng, lat, maxDistance);
    } else {
      locations = await Location.findNearbyActive(lng, lat, maxDistance);
    }

    // Calculate distance for each result
    const resultsWithDistance = locations.map((loc) => {
      const locCoords = loc.currentLocation.coordinates;
      const distance = calculateDistance(lat, lng, locCoords[1], locCoords[0]);
      return {
        ...loc.toObject(),
        distance: Math.round(distance), // Distance in meters
        distanceText: formatDistance(distance),
      };
    });

    res.json({
      success: true,
      count: resultsWithDistance.length,
      searchCenter: { latitude: lat, longitude: lng },
      radiusMeters: maxDistance,
      results: resultsWithDistance,
    });
  } catch (error) {
    console.error("Error finding nearby locations:", error);
    res.status(500).json({ error: "Failed to find nearby locations" });
  }
};

/**
 * Find nearby emergencies (convenience endpoint)
 * GET /api/location/nearby/emergencies
 */
export const findNearbyEmergencies = async (req, res) => {
  req.query.emergencyOnly = "true";
  return findNearby(req, res);
};

/**
 * Calculate distance between two points using Haversine formula
 * @returns Distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Format distance for display
 */
function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}
