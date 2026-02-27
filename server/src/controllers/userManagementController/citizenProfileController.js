import CitizenProfile from "../../models/userProfileModel/CitizenProfile.js";
import User from "../../models/user.js";

export const createCitizenProfile = async (req, res) => {
  try {
    // Only CITIZEN can create
    const userId = req.user._id;
    const {
      phone,
      address,
      location,
      emergencyContactName,
      emergencyContactPhone,
    } = req.body;
    const existsProfile = await CitizenProfile.findOne({
      userId: req.user._id,
    });

    if (
      !phone ||
      !address ||
      !emergencyContactName ||
      !emergencyContactPhone
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: phone, address, emergencyContactName, emergencyContactPhone",
      });
    } else if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User Not Exists",
      });
    } else if (existsProfile) {
      return res.status(409).json({
        success: false,
        message: "Citizen profile already exists",
      });
    }

    const profile = await CitizenProfile.create({
      userId,
      phone,
      address,
      location,
      emergencyContactName,
      emergencyContactPhone,
    });

    return res.status(201).json({
      success: true,
      message: "Citizen profile created successfully",
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create citizen profile",
      error: error.message,
    });
  }
};

export const getCitizenProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const profile = await CitizenProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Citizen profile not found" });
    }

    const profileData = {
      ...profile.toObject(),
      name: user.name,
      email: user.email,
    };

    return res
      .status(200)
      .json({ success: true, profileData, message: "Citizen profile retrieved" });

  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Citizen profile retrieved failed",
        error: error.message,
      });
  }
};

export const updateCitizenProfile = async (req, res) => {
  try {
    const updatedProfile = await CitizenProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: req.body },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Citizen profile not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Profile updated successfully", profile: updatedProfile });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Update failed", error: error.message });
  }
};


export const deleteCitizenProfile = async (req, res) => {
  try {

    const deletedUser = await User.findByIdAndDelete(req.user._id);

    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const deletedProfile = await CitizenProfile.findOneAndDelete({
      userId: req.user._id,
    });

    if (!deletedProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Citizen profile not found" });
    }

    const isProd = process.env.NODE_ENV === "production";

     res.clearCookie("access_token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

    return res
      .status(200)
      .json({ success: true, message: "Citizen profile deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Citizen profile Delete failed",
        error: error.message,
      });
  }
};
