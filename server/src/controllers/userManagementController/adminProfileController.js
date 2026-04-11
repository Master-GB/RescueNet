import User from "../../models/user.js";
import { destroyCloudinaryAssetByPublicId } from "../../services/cloudinaryAssetService.js";

const toAdminProfilePayload = (user) => ({
  id: user?._id || null,
  name: user?.name || "",
  email: user?.email || "",
  role: user?.role || "ADMIN",
  profileImageUrl: user?.profileImageUrl || null,
  createdAt: user?.createdAt || null,
  updatedAt: user?.updatedAt || null,
});

export const getAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admin profile retrieved successfully.",
      profileData: toAdminProfilePayload(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve admin profile.",
      error: error.message,
    });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const nextName = typeof req.body?.name === "string" ? req.body.name.trim() : "";

    if (!nextName) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          name: nextName,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admin profile updated successfully.",
      profileData: toAdminProfilePayload(updatedUser),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update admin profile.",
      error: error.message,
    });
  }
};

export const deleteAdminProfile = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user._id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    let cleanupWarning = "";
    if (deletedUser.profileImagePublicId) {
      const cleanupResult = await destroyCloudinaryAssetByPublicId(deletedUser.profileImagePublicId);
      if (!cleanupResult.success) {
        cleanupWarning = "Admin account deleted, but failed to remove profile image from Cloudinary.";
        console.warn(
          `[CloudinaryCleanup] Admin delete cleanup failed for user ${deletedUser._id}: ${cleanupResult.reason}`,
        );
      }
    }

    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

    const responsePayload = {
      success: true,
      message: "Admin account deleted successfully.",
    };

    if (cleanupWarning) {
      responsePayload.warning = cleanupWarning;
    }

    return res.status(200).json(responsePayload);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete admin account.",
      error: error.message,
    });
  }
};
