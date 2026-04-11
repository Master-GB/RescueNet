import { jest } from "@jest/globals";

const userFindByIdMock = jest.fn();
const userFindByIdAndUpdateMock = jest.fn();
const userFindByIdAndDeleteMock = jest.fn();

await jest.unstable_mockModule("../../../models/user.js", () => ({
  default: {
    findById: userFindByIdMock,
    findByIdAndUpdate: userFindByIdAndUpdateMock,
    findByIdAndDelete: userFindByIdAndDeleteMock,
  },
}));

const destroyCloudinaryAssetByPublicIdMock = jest.fn();
await jest.unstable_mockModule("../../../services/cloudinaryAssetService.js", () => ({
  destroyCloudinaryAssetByPublicId: destroyCloudinaryAssetByPublicIdMock,
}));

const {
  deleteAdminProfile,
  getAdminProfile,
  updateAdminProfile,
} = await import("../../../controllers/userManagementController/adminProfileController.js");

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.clearCookie = jest.fn(() => res);
  return res;
}

describe("adminProfileController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAdminProfile", () => {
    test("should return 404 when admin account does not exist", async () => {
      userFindByIdMock.mockResolvedValue(null);

      const req = { user: { _id: "admin-1" } };
      const res = mockRes();

      await getAdminProfile(req, res);

      expect(userFindByIdMock).toHaveBeenCalledWith("admin-1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Admin account not found.",
      });
    });

    test("should return profile payload for existing admin account", async () => {
      userFindByIdMock.mockResolvedValue({
        _id: "admin-1",
        name: "Admin User",
        email: "admin@rescuenet.lk",
        role: "ADMIN",
        profileImageUrl: "https://cdn.example/admin.jpg",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
      });

      const req = { user: { _id: "admin-1" } };
      const res = mockRes();

      await getAdminProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Admin profile retrieved successfully.",
          profileData: expect.objectContaining({
            id: "admin-1",
            name: "Admin User",
            email: "admin@rescuenet.lk",
          }),
        }),
      );
    });

    test("should return 500 when get profile throws", async () => {
      userFindByIdMock.mockRejectedValue(new Error("db exploded"));

      const req = { user: { _id: "admin-1" } };
      const res = mockRes();

      await getAdminProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Failed to retrieve admin profile.",
          error: "db exploded",
        }),
      );
    });
  });

  describe("updateAdminProfile", () => {
    test("should return 400 when name is missing", async () => {
      const req = { user: { _id: "admin-1" }, body: {} };
      const res = mockRes();

      await updateAdminProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Name is required.",
      });
    });

    test("should return 404 when admin to update is missing", async () => {
      userFindByIdAndUpdateMock.mockResolvedValue(null);

      const req = { user: { _id: "admin-1" }, body: { name: "New Name" } };
      const res = mockRes();

      await updateAdminProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Admin account not found.",
      });
    });

    test("should update admin name and return 200", async () => {
      userFindByIdAndUpdateMock.mockResolvedValue({
        _id: "admin-1",
        name: "Updated Name",
        email: "admin@rescuenet.lk",
        role: "ADMIN",
      });

      const req = { user: { _id: "admin-1" }, body: { name: "  Updated Name  " } };
      const res = mockRes();

      await updateAdminProfile(req, res);

      expect(userFindByIdAndUpdateMock).toHaveBeenCalledWith(
        "admin-1",
        {
          $set: {
            name: "Updated Name",
          },
        },
        expect.objectContaining({ returnDocument: "after" }),
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Admin profile updated successfully.",
          profileData: expect.objectContaining({ name: "Updated Name" }),
        }),
      );
    });

    test("should return 500 when update throws", async () => {
      userFindByIdAndUpdateMock.mockRejectedValue(new Error("update crashed"));

      const req = { user: { _id: "admin-1" }, body: { name: "Updated Name" } };
      const res = mockRes();

      await updateAdminProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Failed to update admin profile.",
          error: "update crashed",
        }),
      );
    });
  });

  describe("deleteAdminProfile", () => {
    test("should return 404 when admin account does not exist", async () => {
      userFindByIdAndDeleteMock.mockResolvedValue(null);

      const req = { user: { _id: "admin-1" } };
      const res = mockRes();

      await deleteAdminProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Admin account not found.",
      });
    });

    test("should delete admin account and clear auth cookie", async () => {
      userFindByIdAndDeleteMock.mockResolvedValue({
        _id: "admin-1",
        profileImagePublicId: "rescuenet_profiles/admin-1",
      });
      destroyCloudinaryAssetByPublicIdMock.mockResolvedValue({ success: true, result: "ok" });

      const req = { user: { _id: "admin-1" } };
      const res = mockRes();

      await deleteAdminProfile(req, res);

      expect(destroyCloudinaryAssetByPublicIdMock).toHaveBeenCalledWith("rescuenet_profiles/admin-1");
      expect(res.clearCookie).toHaveBeenCalledWith(
        "access_token",
        expect.objectContaining({
          httpOnly: true,
        }),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Admin account deleted successfully.",
      });
    });

    test("should return warning when Cloudinary cleanup fails", async () => {
      userFindByIdAndDeleteMock.mockResolvedValue({
        _id: "admin-1",
        profileImagePublicId: "rescuenet_profiles/admin-1",
      });
      destroyCloudinaryAssetByPublicIdMock.mockResolvedValue({
        success: false,
        reason: "cloudinary-timeout",
      });

      const req = { user: { _id: "admin-1" } };
      const res = mockRes();

      await deleteAdminProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          warning: "Admin account deleted, but failed to remove profile image from Cloudinary.",
        }),
      );
    });

    test("should return 500 when delete throws", async () => {
      userFindByIdAndDeleteMock.mockRejectedValue(new Error("delete failed"));

      const req = { user: { _id: "admin-1" } };
      const res = mockRes();

      await deleteAdminProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Failed to delete admin account.",
          error: "delete failed",
        }),
      );
    });
  });
});
