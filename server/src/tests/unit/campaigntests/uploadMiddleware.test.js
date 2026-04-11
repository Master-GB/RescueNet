import { jest } from "@jest/globals";

// ── mock cloudinary & multer-storage-cloudinary & multer ──

const cloudinaryConfigMock = jest.fn();

await jest.unstable_mockModule("cloudinary", () => ({
  v2: {
    config: cloudinaryConfigMock,
  },
}));

const CloudinaryStorageMock = jest.fn().mockImplementation((opts) => opts);

await jest.unstable_mockModule("multer-storage-cloudinary", () => ({
  CloudinaryStorage: CloudinaryStorageMock,
}));

const multerMock = jest.fn().mockImplementation((opts) => ({
  storage: opts.storage,
  single: jest.fn(),
}));

await jest.unstable_mockModule("multer", () => ({
  default: multerMock,
}));

// ── set env vars before importing ──
process.env.CLOUDINARY_CLOUD_NAME = "test_cloud";
process.env.CLOUDINARY_API_KEY = "test_key";
process.env.CLOUDINARY_API_SECRET = "test_secret";

// ── import after mocks ──
const {
  upload,
  uploadCampaignImage,
  handleProfileImageUpload,
} = await import("../../../middleware/uploadMiddleware.js");

describe("Upload Middleware - Unit Tests", () => {
  test("should call cloudinary.config with env variables", () => {
    expect(cloudinaryConfigMock).toHaveBeenCalledWith({
      cloud_name: "test_cloud",
      api_key: "test_key",
      api_secret: "test_secret",
    });
  });

  test("should create CloudinaryStorage with correct folder", () => {
    expect(CloudinaryStorageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          folder: "rescuenet_donations",
        }),
      })
    );
  });

  test("should create CloudinaryStorage for profile images", () => {
    expect(CloudinaryStorageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          folder: "rescuenet_profiles",
        }),
      })
    );
  });

  test("should allow only jpeg, png, and jpg formats", () => {
    const call = CloudinaryStorageMock.mock.calls[0][0];
    expect(call.params.allowed_formats).toEqual(
      expect.arrayContaining(["jpeg", "png", "jpg"])
    );
    expect(call.params.allowed_formats).toHaveLength(3);
  });

  test("should create multer instance with the storage engine", () => {
    expect(multerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        storage: expect.any(Object),
      })
    );
  });

  test("should export an upload object", () => {
    expect(upload).toBeDefined();
    expect(uploadCampaignImage).toBeDefined();
    expect(handleProfileImageUpload).toBeDefined();
  });
});
