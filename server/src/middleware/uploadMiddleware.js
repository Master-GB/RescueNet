import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

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

export const upload = multer({ storage: donationStorage });
export const uploadCampaignImage = multer({ storage: campaignStorage });
