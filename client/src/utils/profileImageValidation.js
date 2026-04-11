export const PROFILE_IMAGE_ACCEPT = "image/jpeg,image/jpg,image/png";
export const PROFILE_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const PROFILE_IMAGE_HELP_TEXT = "JPG or PNG, up to 5MB.";

const ALLOWED_PROFILE_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png"]);

export const validateProfileImageFile = (file) => {
  if (!file) {
    return "No image selected.";
  }

  if (!ALLOWED_PROFILE_IMAGE_TYPES.has(file.type)) {
    return "Invalid image format. Upload a JPG or PNG image.";
  }

  if (file.size > PROFILE_IMAGE_MAX_SIZE_BYTES) {
    return "Profile image must be 5MB or smaller.";
  }

  return "";
};
