import { jest } from "@jest/globals";

// --------------------
// Helpers
// --------------------
function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("Citizen Profile Controller", () => {
  beforeEach(() => {
    // ✅ Important for ESM: clears module cache so mocks apply correctly
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("getCitizenProfile", () => {
    test("should return profile", async () => {
      await jest.isolateModulesAsync(async () => {
        const userFindByIdMock = jest.fn().mockResolvedValue({ _id: "u1", name: "John", email: "john@example.com" });
        const profileFindOneMock = jest.fn().mockResolvedValue({ 
          _id: "p1", 
          userId: "u1", 
          phone: "+94770000000",
          toObject: jest.fn().mockReturnValue({ _id: "p1", userId: "u1", phone: "+94770000000" })
        });

        await jest.unstable_mockModule("../../../models/user.js", () => ({
          default: { findById: userFindByIdMock },
        }));
        
        await jest.unstable_mockModule("../../../models/userProfileModel/CitizenProfile.js", () => ({
          default: { findOne: profileFindOneMock },
        }));

        const { getCitizenProfile } = await import(
          "../../../controllers/userManagementController/citizenProfileController.js"
        );

        const req = { user: { _id: "u1" } };
        const res = mockRes();

        await getCitizenProfile(req, res);

        expect(userFindByIdMock).toHaveBeenCalledWith("u1");
        expect(profileFindOneMock).toHaveBeenCalledWith({ userId: "u1" });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            profileData: expect.objectContaining({
              name: "John",
              email: "john@example.com",
            })
          })
        );
      });
    });

    test("should return 404 if user not found", async () => {
      const userFindByIdMock = jest.fn().mockResolvedValue(null);
      const profileFindOneMock = jest.fn();

      await jest.isolateModulesAsync(async () => {
        await jest.unstable_mockModule(
          "../../../models/user.js",
          () => ({
            default: { findById: userFindByIdMock },
          })
        );
        
        await jest.unstable_mockModule(
          "../../../models/userProfileModel/CitizenProfile.js",
          () => ({
            default: { findOne: profileFindOneMock },
          })
        );

        const { getCitizenProfile } = await import(
          "../../../controllers/userManagementController/citizenProfileController.js"
        );

        const req = { user: { _id: "u1" } };
        const res = mockRes();

        await getCitizenProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: "User not found",
          })
        );
      });
    });

    test("should return 404 if profile not found", async () => {
      const userFindByIdMock = jest.fn().mockResolvedValue({ _id: "u1", name: "John", email: "john@example.com" });
      const profileFindOneMock = jest.fn().mockResolvedValue(null);

      await jest.isolateModulesAsync(async () => {
        await jest.unstable_mockModule(
          "../../../models/user.js",
          () => ({
            default: { findById: userFindByIdMock },
          })
        );
        
        await jest.unstable_mockModule(
          "../../../models/userProfileModel/CitizenProfile.js",
          () => ({
            default: { findOne: profileFindOneMock },
          })
        );

        const { getCitizenProfile } = await import(
          "../../../controllers/userManagementController/citizenProfileController.js"
        );

        const req = { user: { _id: "u1" } };
        const res = mockRes();

        await getCitizenProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: "Citizen profile not found",
          })
        );
      });
    });

    test("should return 500 on error", async () => {
      const userFindByIdMock = jest.fn().mockRejectedValue(new Error("DB error"));

      await jest.isolateModulesAsync(async () => {
        await jest.unstable_mockModule(
          "../../../models/user.js",
          () => ({
            default: { findById: userFindByIdMock },
          })
        );

        const { getCitizenProfile } = await import(
          "../../../controllers/userManagementController/citizenProfileController.js"
        );

        const req = { user: { _id: "u1" } };
        const res = mockRes();

        await getCitizenProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: "Citizen profile retrieved failed",
          })
        );
      });
    });
  });

  describe("createCitizenProfile", () => {
    test("should return 400 if missing required fields", async () => {
      const findOneMock = jest.fn().mockResolvedValue(null);

      await jest.isolateModulesAsync(async () => {
        await jest.unstable_mockModule(
          "../../../models/userProfileModel/CitizenProfile.js",
          () => ({
            default: {
              findOne: findOneMock,
              create: jest.fn(),
            },
          })
        );

        const { createCitizenProfile } = await import(
          "../../../controllers/userManagementController/citizenProfileController.js"
        );

        const req = {
          user: { _id: "u1", role: "CITIZEN" },
          body: {
            phone: "+94770000000",
            // Missing address, emergencyContactName, emergencyContactPhone
          },
        };
        const res = mockRes();

        await createCitizenProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: "Missing required fields: phone, address, emergencyContactName, emergencyContactPhone",
          })
        );
      });
    });

    test("should return 400 if userId missing", async () => {
      const findOneMock = jest.fn().mockResolvedValue(null);

      await jest.isolateModulesAsync(async () => {
        await jest.unstable_mockModule(
          "../../../models/userProfileModel/CitizenProfile.js",
          () => ({
            default: {
              findOne: findOneMock,
              create: jest.fn(),
            },
          })
        );

        const { createCitizenProfile } = await import(
          "../../../controllers/userManagementController/citizenProfileController.js"
        );

        const req = {
          user: {}, // Missing _id
          body: {
            phone: "+94770000000",
            address: { street: "A", city: "B", province: "C" },
            emergencyContactName: "EC",
            emergencyContactPhone: "+94771111111",
          },
        };
        const res = mockRes();

        await createCitizenProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: "User Not Exists",
          })
        );
      });
    });

    test("should return 409 if profile already exists", async () => {
      const findOneMock = jest.fn().mockResolvedValue({ _id: "p1" });
      const createMock = jest.fn();

      await jest.isolateModulesAsync(async () => {
        await jest.unstable_mockModule(
          "../../../models/userProfileModel/CitizenProfile.js",
          () => ({
            default: {
              findOne: findOneMock,
              create: createMock,
            },
          })
        );

        const { createCitizenProfile } = await import(
          "../../../controllers/userManagementController/citizenProfileController.js"
        );

        const req = {
          user: { _id: "u1", role: "CITIZEN" },
          body: {
            phone: "+94770000000",
            address: { street: "A", city: "B", province: "C" },
            emergencyContactName: "EC",
            emergencyContactPhone: "+94771111111",
          },
        };
        const res = mockRes();

        await createCitizenProfile(req, res);

        expect(findOneMock).toHaveBeenCalledWith({ userId: "u1" });
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({ success: false })
        );
      });
    });

    test("should create profile and return 201", async () => {
      const findOneMock = jest.fn().mockResolvedValue(null);
      const createMock = jest.fn().mockResolvedValue({
        _id: "p1",
        userId: "u1",
        phone: "+94770000000",
      });

      await jest.isolateModulesAsync(async () => {
        await jest.unstable_mockModule(
          "../../../models/userProfileModel/CitizenProfile.js",
          () => ({
            default: {
              findOne: findOneMock,
              create: createMock,
            },
          })
        );

        const { createCitizenProfile } = await import(
          "../../../controllers/userManagementController/citizenProfileController.js"
        );

        const req = {
          user: { _id: "u1", role: "CITIZEN" },
          body: {
            phone: "+94770000000",
            address: { street: "123", city: "Colombo", province: "Western" },
            location: "Colombo 05",
            emergencyContactName: "Nimal",
            emergencyContactPhone: "+94771111111",
            savedShelters: [],
          },
        };
        const res = mockRes();

        await createCitizenProfile(req, res);

        expect(createMock).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: "u1",
            phone: "+94770000000",
          })
        );

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({ success: true })
        );
      });
    });

    test("should return 500 if create fails", async () => {
      const findOneMock = jest.fn().mockResolvedValue(null);
      const createMock = jest.fn().mockRejectedValue(new Error("DB error"));

      await jest.isolateModulesAsync(async () => {
        await jest.unstable_mockModule(
          "../../../models/userProfileModel/CitizenProfile.js",
          () => ({
            default: {
              findOne: findOneMock,
              create: createMock,
            },
          })
        );

        const { createCitizenProfile } = await import(
          "../../../controllers/userManagementController/citizenProfileController.js"
        );

        const req = {
          user: { _id: "u1", role: "CITIZEN" },
          body: {
            phone: "+94770000000",
            address: { street: "123", city: "Colombo", province: "Western" },
            emergencyContactName: "Nimal",
            emergencyContactPhone: "+94771111111",
          },
        };
        const res = mockRes();

        await createCitizenProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: "Failed to create citizen profile",
          })
        );
      });
    });
  });

  describe("updateCitizenProfile", () => {
    test("should return 404 if profile not found", async () => {
      const findOneAndUpdateMock = jest.fn().mockResolvedValue(null);

      await jest.isolateModulesAsync(async () => {
        await jest.unstable_mockModule(
          "../../../models/userProfileModel/CitizenProfile.js",
          () => ({
            default: { findOneAndUpdate: findOneAndUpdateMock },
          })
        );

        const { updateCitizenProfile } = await import(
          "../../../controllers/userManagementController/citizenProfileController.js"
        );

        const req = { user: { _id: "u1" }, body: { location: "Kandy" } };
        const res = mockRes();

        await updateCitizenProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Citizen profile not found",
        });
      });
    });

    test("should update and return 200", async () => {
      const findOneAndUpdateMock = jest.fn().mockResolvedValue({
        _id: "p1",
        userId: "u1",
        location: "Kandy",
      });

      await jest.isolateModulesAsync(async () => {
        await jest.unstable_mockModule(
          "../../../models/userProfileModel/CitizenProfile.js",
          () => ({
            default: { findOneAndUpdate: findOneAndUpdateMock },
          })
        );

        const { updateCitizenProfile } = await import(
          "../../../controllers/userManagementController/citizenProfileController.js"
        );

        const req = { user: { _id: "u1" }, body: { location: "Kandy" } };
        const res = mockRes();

        await updateCitizenProfile(req, res);

        expect(findOneAndUpdateMock).toHaveBeenCalledWith(
          { userId: "u1" },
          { $set: { location: "Kandy" } },
          expect.objectContaining({ returnDocument: "after" })
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            profile: expect.objectContaining({ location: "Kandy" }),
          })
        );
      });
    });

    test("should return 500 on error", async () => {
      const findOneAndUpdateMock = jest.fn().mockRejectedValue(new Error("DB error"));

      await jest.isolateModulesAsync(async () => {
        await jest.unstable_mockModule(
          "../../../models/userProfileModel/CitizenProfile.js",
          () => ({
            default: { findOneAndUpdate: findOneAndUpdateMock },
          })
        );

        const { updateCitizenProfile } = await import(
          "../../../controllers/userManagementController/citizenProfileController.js"
        );

        const req = { user: { _id: "u1" }, body: { location: "Kandy" } };
        const res = mockRes();

        await updateCitizenProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: "Update failed",
          })
        );
      });
    });
  });

  describe("deleteCitizenProfile", () => {
    test("should return 404 if user not found", async () => {
      const userFindByIdAndDeleteMock = jest.fn().mockResolvedValue(null);
      const profileFindOneAndDeleteMock = jest.fn();

      await jest.isolateModulesAsync(async () => {
        await jest.unstable_mockModule(
          "../../../models/user.js",
          () => ({
            default: { findByIdAndDelete: userFindByIdAndDeleteMock },
          })
        );
        
        await jest.unstable_mockModule(
          "../../../models/userProfileModel/CitizenProfile.js",
          () => ({
            default: { findOneAndDelete: profileFindOneAndDeleteMock },
          })
        );

        const { deleteCitizenProfile } = await import(
          "../../../controllers/userManagementController/citizenProfileController.js"
        );

        const req = { user: { _id: "u1" } };
        const res = mockRes();

        await deleteCitizenProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: "User not found",
          })
        );
      });
    });

    test("should return 404 if profile not found", async () => {
      const userFindByIdAndDeleteMock = jest.fn().mockResolvedValue({ _id: "u1" });
      const profileFindOneAndDeleteMock = jest.fn().mockResolvedValue(null);

      await jest.isolateModulesAsync(async () => {
        await jest.unstable_mockModule(
          "../../../models/user.js",
          () => ({
            default: { findByIdAndDelete: userFindByIdAndDeleteMock },
          })
        );
        
        await jest.unstable_mockModule(
          "../../../models/userProfileModel/CitizenProfile.js",
          () => ({
            default: { findOneAndDelete: profileFindOneAndDeleteMock },
          })
        );

        const { deleteCitizenProfile } = await import(
          "../../../controllers/userManagementController/citizenProfileController.js"
        );

        const req = { user: { _id: "u1" } };
        const res = mockRes();

        await deleteCitizenProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: "Citizen profile not found",
          })
        );
      });
    });

    test("should delete user and profile and return 200", async () => {
      const userFindByIdAndDeleteMock = jest.fn().mockResolvedValue({ _id: "u1" });
      const profileFindOneAndDeleteMock = jest.fn().mockResolvedValue({ _id: "p1", userId: "u1" });
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "test";

      await jest.isolateModulesAsync(async () => {
        await jest.unstable_mockModule(
          "../../../models/user.js",
          () => ({
            default: { findByIdAndDelete: userFindByIdAndDeleteMock },
          })
        );
        
        await jest.unstable_mockModule(
          "../../../models/userProfileModel/CitizenProfile.js",
          () => ({
            default: { findOneAndDelete: profileFindOneAndDeleteMock },
          })
        );

        const { deleteCitizenProfile } = await import(
          "../../../controllers/userManagementController/citizenProfileController.js"
        );

        const req = { user: { _id: "u1" } };
        const res = mockRes();
        res.clearCookie = jest.fn();

        await deleteCitizenProfile(req, res);

        expect(userFindByIdAndDeleteMock).toHaveBeenCalledWith("u1");
        expect(profileFindOneAndDeleteMock).toHaveBeenCalledWith({ userId: "u1" });
        expect(res.clearCookie).toHaveBeenCalledWith("access_token", {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            message: "Citizen profile deleted successfully",
          })
        );
      });

      process.env.NODE_ENV = originalEnv;
    });

    test("should handle production environment correctly", async () => {
      const userFindByIdAndDeleteMock = jest.fn().mockResolvedValue({ _id: "u1" });
      const profileFindOneAndDeleteMock = jest.fn().mockResolvedValue({ _id: "p1", userId: "u1" });
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      await jest.isolateModulesAsync(async () => {
        await jest.unstable_mockModule(
          "../../../models/user.js",
          () => ({
            default: { findByIdAndDelete: userFindByIdAndDeleteMock },
          })
        );
        
        await jest.unstable_mockModule(
          "../../../models/userProfileModel/CitizenProfile.js",
          () => ({
            default: { findOneAndDelete: profileFindOneAndDeleteMock },
          })
        );

        const { deleteCitizenProfile } = await import(
          "../../../controllers/userManagementController/citizenProfileController.js"
        );

        const req = { user: { _id: "u1" } };
        const res = mockRes();
        res.clearCookie = jest.fn();

        await deleteCitizenProfile(req, res);

        expect(res.clearCookie).toHaveBeenCalledWith("access_token", {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        });
      });

      process.env.NODE_ENV = originalEnv;
    });

    test("should return 500 on error", async () => {
      const userFindByIdAndDeleteMock = jest.fn().mockRejectedValue(new Error("DB error"));

      await jest.isolateModulesAsync(async () => {
        await jest.unstable_mockModule(
          "../../../models/user.js",
          () => ({
            default: { findByIdAndDelete: userFindByIdAndDeleteMock },
          })
        );

        const { deleteCitizenProfile } = await import(
          "../../../controllers/userManagementController/citizenProfileController.js"
        );

        const req = { user: { _id: "u1" } };
        const res = mockRes();

        await deleteCitizenProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: "Citizen profile Delete failed",
          })
        );
      });
    });
  });
});
