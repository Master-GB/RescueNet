import VolunteerProfile from "../../models/userProfileModel/VolunteerProfile.js";
import User from "../../models/user.js";
import Location from "../../models/Location.js";
import HelpRequest from "../../models/HelpRequest.js";

const parseCoords = (raw) => {
  if (!raw || typeof raw !== "string") return null;
  const parts = raw.split(",").map((item) => Number(item.trim()));
  if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) {
    return null;
  }

  return { lat: parts[0], lon: parts[1] };
};

const toZoneKey = (coords) => `${coords.lat.toFixed(2)}:${coords.lon.toFixed(2)}`;

export const createVolunteerProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { phone, skills, serviceDistricts, availabilityStatus } = req.body;
    const existsProfile = await VolunteerProfile.findOne({
      userId: req.user._id,
    });

     if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required field: phone" });
    } else if (existsProfile) {
      return res
        .status(409)
        .json({ success: false, message: "Volunteer profile already exists" });
    }

    const profile = await VolunteerProfile.create({
      userId,
      phone,
      skills: skills || [],
      serviceDistricts: serviceDistricts || [],
      availabilityStatus: availabilityStatus || "OFFLINE",
      verifiedByAdmin: false, // must be verified by admin later
    });

    return res.status(201).json({
      success: true,
      message: "Volunteer profile created successfully",
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create volunteer profile",
      error: error.message,
    });
  }
};

export const getVolunteerProfile = async (req, res) => {
  try {


    const profile = await VolunteerProfile.findOne({ userId: req.user._id });
    const user = await User.findById(req.user._id);

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Volunteer profile not found" });
    }
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const profileData = {
      ...profile.toObject(),
      name: user.name,
      email: user.email,
    };
    return res
      .status(200)
      .json({
        success: true,
        profileData,
        message: "Volunteer profile retrieved",
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Volunteer profile retrieved failed",
        error: error.message,
      });
  }
};

export const updateVolunteerProfile = async (req, res) => {
  try {
   
    const updatedProfile = await VolunteerProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: req.body },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Volunteer profile not found" });
    }

    return res
      .status(200)
      .json({
        success: true,
        message: "Profile updated successfully",
        profile: updatedProfile,
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Profile Update failed",
        error: error.message,
      });
  }
};

export const updateAvailabilityStatus = async (req, res) => {
  try {

    const { availabilityStatus } = req.body;

    if (
      !availabilityStatus ||
      !["AVAILABLE", "BUSY", "OFFLINE"].includes(availabilityStatus)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid availability status. Must be one of: AVAILABLE, BUSY, OFFLINE",
      });
    }

    const updated = await VolunteerProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { availabilityStatus } },
     { returnDocument: "after", runValidators: true },
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Volunteer profile not found" });
    }

    return res
      .status(200)
      .json({
        success: true,
        message: "Status updated successfully",
        profile: updated,
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update status",
      error: error.message,
    });
  }
};

export const deleteVolunteerProfile = async (req, res) => {
  try {

    const deletedUser = await User.findByIdAndDelete(req.user._id);

     if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

     const deletedProfile = await VolunteerProfile.findOneAndDelete({
      userId: req.user._id,
    });
    
    if (!deletedProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Volunteer profile not found" });
    }

    const isProd = process.env.NODE_ENV === "production";

     res.clearCookie("access_token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

    return res
      .status(200)
      .json({
        success: true,
        message: "Volunteer profile deleted successfully",
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete volunteer profile",
        error: error.message,
      });
  }
};

export const getTeamPresence = async (req, res) => {
  try {
    const [profiles, activeSessions, activeRequests] = await Promise.all([
      VolunteerProfile.find({ verifiedByAdmin: true })
        .select("userId availabilityStatus skills serviceDistricts acceptedTasks updatedAt")
        .lean(),
      Location.find({ isSharing: true })
        .select("userId userName isOnline lastSignalAt currentLocation")
        .lean(),
      HelpRequest.find({ status: { $in: ["pending", "assigned", "in-progress"] } })
        .select("_id urgency status realLocation location")
        .lean(),
    ]);

    const volunteerIds = profiles.map((profile) => profile.userId).filter(Boolean);
    const users = await User.find({ _id: { $in: volunteerIds } })
      .select("_id name email")
      .lean();

    const userMap = new Map(users.map((user) => [String(user._id), user]));
    const sessionMap = new Map(
      activeSessions
        .filter((session) => session.userId)
        .map((session) => [String(session.userId), session]),
    );

    const thirtySecondsAgo = Date.now() - 30000;

    const volunteers = profiles.map((profile) => {
      const key = String(profile.userId);
      const user = userMap.get(key);
      const session = sessionMap.get(key);

      const coords = session?.currentLocation?.coordinates
        ? {
            lon: session.currentLocation.coordinates[0],
            lat: session.currentLocation.coordinates[1],
          }
        : null;

      const isOnline = Boolean(session?.lastSignalAt && new Date(session.lastSignalAt).getTime() > thirtySecondsAgo);

      return {
        userId: key,
        name: user?.name || session?.userName || "Volunteer",
        email: user?.email || "",
        availabilityStatus: profile.availabilityStatus || "OFFLINE",
        skills: profile.skills || [],
        serviceDistricts: profile.serviceDistricts || [],
        activeTaskCount: Array.isArray(profile.acceptedTasks) ? profile.acceptedTasks.length : 0,
        isOnline,
        coords,
        lastSignalAt: session?.lastSignalAt || null,
      };
    });

    const zonesMap = new Map();

    activeRequests.forEach((request) => {
      const coords = parseCoords(request.realLocation) || parseCoords(request.location);
      if (!coords) return;

      const key = toZoneKey(coords);
      const existing = zonesMap.get(key);

      if (!existing) {
        zonesMap.set(key, {
          zoneId: key,
          center: coords,
          requestCount: 1,
          highUrgencyCount: request.urgency === "high" ? 1 : 0,
          statuses: new Set([request.status || "pending"]),
        });
        return;
      }

      existing.requestCount += 1;
      if (request.urgency === "high") {
        existing.highUrgencyCount += 1;
      }
      existing.statuses.add(request.status || "pending");
    });

    const zones = Array.from(zonesMap.values()).map((zone) => {
      const severity =
        zone.highUrgencyCount > 0
          ? "high"
          : zone.requestCount >= 3
            ? "medium"
            : "low";

      return {
        zoneId: zone.zoneId,
        center: zone.center,
        requestCount: zone.requestCount,
        highUrgencyCount: zone.highUrgencyCount,
        severity,
        radiusMeters: 450 + zone.requestCount * 80,
        statuses: Array.from(zone.statuses),
      };
    });

    return res.status(200).json({
      success: true,
      volunteers,
      zones,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get team presence",
      error: error.message,
    });
  }
};
