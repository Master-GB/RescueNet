import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

const ALLOWED_PROFILE_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png"]);
const PROFILE_IMAGE_MAX_SIZE = 5 * 1024 * 1024;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// check if the env variables are loaded correctly
if (!process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET) {
  console.error("Cloudinary configuration is missing. Please check your environment variables.");
  // process.exit(1);
}

const createStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: ["jpeg", "png", "jpg"],
    },
  });

const donationStorage = createStorage("rescuenet_donations");
const campaignStorage = createStorage("rescuenet_campaigns");
const profileStorage = createStorage("rescuenet_profiles");

export const upload = multer({ storage: donationStorage });
export const uploadCampaignImage = multer({ storage: campaignStorage });

const profileImageUpload = multer({
  storage: profileStorage,
  limits: {
    fileSize: PROFILE_IMAGE_MAX_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_PROFILE_MIME_TYPES.has(file.mimetype)) {
      const formatError = new Error("Invalid image format. Upload a JPG or PNG image.");
      formatError.status = 400;
      cb(formatError);
      return;
    }

    cb(null, true);
  },
});

export const handleProfileImageUpload = (req, res, next) => {
  profileImageUpload.single("profileImage")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Profile image must be 5MB or smaller.",
      });
    }

    return res.status(error.status || 400).json({
      success: false,
      message: error.message || "Failed to process profile image upload.",
    });
  });
};
