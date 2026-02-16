import express from "express";
import {
  startSharing,
  updateLocation,
  stopSharing,
  getLocation,
  getLocationHistory,
  getActiveSessions,
  activateEmergency,
  markSafe,
  findNearby,
  findNearbyEmergencies,
} from "../controllers/locationController.js";

const router = express.Router();

/**
 * @route   GET /api/location/active
 * @desc    Get all active location sharing sessions
 * @query   emergencyOnly - If "true", only return emergency sessions
 * @access  Public (should be protected in production)
 */
router.get("/active", getActiveSessions);

/**
 * @route   GET /api/location/nearby
 * @desc    Find nearby users sharing location (geospatial query)
 * @query   latitude - Center point latitude (required)
 * @query   longitude - Center point longitude (required)
 * @query   radius - Search radius in meters (default: 10000 = 10km)
 * @query   emergencyOnly - Only return emergency sessions (default: false)
 * @access  Public (should be protected in production)
 */
router.get("/nearby", findNearby);

/**
 * @route   GET /api/location/nearby/emergencies
 * @desc    Find nearby emergencies (convenience endpoint)
 * @query   latitude - Center point latitude (required)
 * @query   longitude - Center point longitude (required)
 * @query   radius - Search radius in meters (default: 10000 = 10km)
 * @access  Public (should be protected in production)
 */
router.get("/nearby/emergencies", findNearbyEmergencies);

/**
 * @route   POST /api/location/start
 * @desc    Start a new location sharing session
 * @body    { latitude, longitude, accuracy?, altitude?, speed?, heading?,
 *            userName?, contactNumber?, isEmergency?, emergencyType?, emergencyMessage? }
 * @access  Public
 */
router.post("/add/start", startSharing);

/**
 * @route   GET /api/location/:sessionId
 * @desc    Get location data for a session (current + last known)
 * @access  Public
 */
router.get("/getid/:sessionId", getLocation);

/**
 * @route   PUT /api/location/:sessionId
 * @desc    Update location for an active session
 * @body    { latitude, longitude, accuracy?, altitude?, speed?, heading? }
 * @access  Public
 */
router.put("/update/:sessionId", updateLocation);

/**
 * @route   PUT /api/location/:sessionId/stop
 * @desc    Stop location sharing for a session
 * @access  Public
 */
router.put("/update/:sessionId/stop", stopSharing);

/**
 * @route   GET /api/location/:sessionId/history
 * @desc    Get location history for a session
 * @query   limit - Number of points to return (default: 50)
 * @access  Public
 */
router.get("/getid/:sessionId/history", getLocationHistory);

/**
 * @route   PUT /api/location/:sessionId/emergency
 * @desc    Activate emergency mode for a session
 * @body    { emergencyType?, emergencyMessage? }
 * @access  Public
 */
router.put("/update/:sessionId/emergency", activateEmergency);

/**
 * @route   PUT /api/location/:sessionId/safe
 * @desc    Mark user as safe (deactivate emergency)
 * @access  Public
 */
router.put("/update/:sessionId/safe", markSafe);

export default router;
