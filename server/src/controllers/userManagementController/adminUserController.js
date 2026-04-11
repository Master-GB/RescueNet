import User from "../../models/user.js";
import VolunteerProfile from "../../models/userProfileModel/VolunteerProfile.js";
import NgoProfile from "../../models/userProfileModel/NgoProfile.js";
import CitizenProfile from "../../models/userProfileModel/CitizenProfile.js";
import { destroyCloudinaryAssetByPublicId } from "../../services/cloudinaryAssetService.js";


export const verifyVolunteer = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user || user.role !== "VOLUNTEER") {
      return res.status(400).json({ success: false, message: "Volunteer user not found" });
    }

    const profile = await VolunteerProfile.findOneAndUpdate(
      { userId },
      { $set: { verifiedByAdmin: true } },
      { returnDocument: "after", runValidators: true },
    );

    return res.status(200).json({ success: true, message: "Volunteer verified", profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Verification failed", error: error.message });
  }
};

export const verifyNgo = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user || user.role !== "NGO") {
      return res.status(400).json({ success: false, message: "NGO user not found" });
    }

    const profile = await NgoProfile.findOneAndUpdate(
      { userId },
      { $set: { verifiedByAdmin: true } },
      { new: true }
    );

    return res.status(200).json({ success: true, message: "NGO verified", profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Verification failed", error: error.message });
  }
};


export const deleteUserAccount = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin deleting themselves
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot delete their own account",
      });
    }

    switch (user.role) {
      case "CITIZEN":
        await CitizenProfile.findOneAndDelete({ userId });
        break;

      case "VOLUNTEER":
        await VolunteerProfile.findOneAndDelete({ userId });
        break;

      case "NGO":
        await NgoProfile.findOneAndDelete({ userId });
        break;

      case "ADMIN":
        return res.status(403).json({
          success: false,
          message: "Cannot delete another admin account",
        });

      default:
        break;
    }

    let cleanupWarning = "";
    if (user.profileImagePublicId) {
      const cleanupResult = await destroyCloudinaryAssetByPublicId(user.profileImagePublicId);
      if (!cleanupResult.success) {
        cleanupWarning = "User account deleted, but failed to remove profile image from Cloudinary.";
        console.warn(
          `[CloudinaryCleanup] Failed for deleted user ${user._id}: ${cleanupResult.reason}`,
        );
      }
    }

    // Delete user account
    await User.findByIdAndDelete(userId);

    const responsePayload = {
      success: true,
      message: "User account and profile deleted successfully",
    };

    if (cleanupWarning) {
      responsePayload.warning = cleanupWarning;
    }

    return res.status(200).json({
      ...responsePayload,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Delete user failed",
      error: error.message,
    });
  }
};