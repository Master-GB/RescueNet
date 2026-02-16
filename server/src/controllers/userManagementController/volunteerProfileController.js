import VolunteerProfile from "../../models/userProfileModel/VolunteerProfile.js";
import User from "../../models/user.js";

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
