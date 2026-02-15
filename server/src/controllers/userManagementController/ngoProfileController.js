import NgoProfile from "../../models/userProfileModel/NgoProfile.js";
import User from "../../models/user.js";

export const createNgoProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const existsProfile = await NgoProfile.findOne({ userId });
    const { registrationNumber, contactPhone, serviceDistricts, availabilityStatus, services } = req.body;

    if (existsProfile) {
      return res
        .status(409)
        .json({ success: false, message: "NGO profile already exists" });
    } else if (!registrationNumber || !contactPhone) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Missing required fields: registrationNumber and contactPhone",
        });
    }

    const profile = await NgoProfile.create({
      userId,
      registrationNumber: registrationNumber,
      contactPhone: contactPhone,
      serviceDistricts: serviceDistricts || "",
      availabilityStatus: availabilityStatus || "OFFLINE",
      services: services || [],
      verifiedByAdmin: false,
    });

    return res
      .status(201)
      .json({
        success: true,
        message: "NGO profile created successfully",
        profile,
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to create NGO profile",
        error: error.message,
      });
  }
};

export const getNgoProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    };

    const profile = await NgoProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "NGO profile not found" });
    };

    const profileData = {
      ...profile.toObject(),
      name: user.name,
      email: user.email,
    };
    return res.status(200).json({ success: true, profileData, message: "NGO profile retrieved" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Profile retrieved failed", error: error.message });
  }
};

export const updateNgoProfile = async (req, res) => {
  try {

    const profileUpdated = await NgoProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: req.body },
      { returnDocument: "after", runValidators: true },
    );


    if (!profileUpdated) {
      return res
        .status(404)
        .json({ success: false, message: "NGO profile not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Profile updated successfully", profile: profileUpdated });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Update failed", error: error.message });
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

    const updated = await NgoProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { availabilityStatus } },
      { returnDocument: "after", runValidators: true },
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "NGO profile not found" });
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

export const deleteNgoProfile = async (req, res) => {
  try {

    const userDelete = await User.findByIdAndDelete(req.user._id);

    if (!userDelete) {
        return res .status(404) .json({ success: false, message: "User not found" });
    };

    const profileDelete = await NgoProfile.findOneAndDelete({ userId: req.user._id });

    if (!profileDelete) {
        return res.status(404).json({ success: false, message: "NGO profile not found" });
    };

    const isProd = process.env.NODE_ENV === "production";

     res.clearCookie("access_token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

    return res
      .status(200)
      .json({ success: true, message: "Profile deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Delete failed", error: error.message });
  }
};
