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
 * @route   POST /api/location/start
 * @desc    Start a new location sharing session
 * @body    { latitude, longitude, accuracy?, altitude?, speed?, heading?,
 *            userName?, contactNumber?, isEmergency?, emergencyType?, emergencyMessage? }
 * @access  Public
 */
router.post("/start", startSharing);

/**
 * @route   GET /api/location/:sessionId
 * @desc    Get location data for a session (current + last known)
 * @access  Public
 */
router.get("/:sessionId", getLocation);

/**
 * @route   PUT /api/location/:sessionId
 * @desc    Update location for an active session
 * @body    { latitude, longitude, accuracy?, altitude?, speed?, heading? }
 * @access  Public
 */
router.put("/:sessionId", updateLocation);

/**
 * @route   PUT /api/location/:sessionId/stop
 * @desc    Stop location sharing for a session
 * @access  Public
 */
router.put("/:sessionId/stop", stopSharing);

/**
 * @route   GET /api/location/:sessionId/history
 * @desc    Get location history for a session
 * @query   limit - Number of points to return (default: 50)
 * @access  Public
 */
router.get("/:sessionId/history", getLocationHistory);

/**
 * @route   PUT /api/location/:sessionId/emergency
 * @desc    Activate emergency mode for a session
 * @body    { emergencyType?, emergencyMessage? }
 * @access  Public
 */
router.put("/:sessionId/emergency", activateEmergency);

/**
 * @route   PUT /api/location/:sessionId/safe
 * @desc    Mark user as safe (deactivate emergency)
 * @access  Public
 */
router.put("/:sessionId/safe", markSafe);

export default router;
