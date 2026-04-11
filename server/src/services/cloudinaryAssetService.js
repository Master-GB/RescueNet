import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const destroyCloudinaryAssetByPublicId = async (publicId) => {
  if (!publicId || typeof publicId !== "string") {
    return {
      success: true,
      skipped: true,
      result: "no-public-id",
    };
  }

  try {
    const destroyResult = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: "image",
    });

    if (!destroyResult) {
      return {
        success: false,
        reason: "unknown",
      };
    }

    if (destroyResult.result === "ok" || destroyResult.result === "not found") {
      return {
        success: true,
        result: destroyResult.result,
      };
    }

    return {
      success: false,
      reason: destroyResult.result,
    };
  } catch (error) {
    return {
      success: false,
      reason: error?.message || "cloudinary-destroy-failed",
    };
  }
};
