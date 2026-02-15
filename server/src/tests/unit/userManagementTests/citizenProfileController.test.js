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
      const findOneMock = jest.fn().mockResolvedValue({ _id: "p1", userId: "u1" });

      await jest.isolateModulesAsync(async () => {
        // ✅ MUST match EXACT import string used inside controller
        await jest.unstable_mockModule(
          "../../../models/userProfileModel/CitizenProfile.js",
          () => ({
            default: { findOne: findOneMock },
          })
        );

        // ✅ Import AFTER mock (inside isolate)
        const { getCitizenProfile } = await import(
          "../../../controllers/userManagementController/citizenProfileController.js"
        );

        const req = { user: { _id: "u1" } };
        const res = mockRes();

        await getCitizenProfile(req, res);
      });
    });

    test("should return 500 on error", async () => {
      const findOneMock = jest.fn().mockRejectedValue(new Error("DB error"));

      await jest.isolateModulesAsync(async () => {
        await jest.unstable_mockModule(
          "../../../models/userProfileModel/CitizenProfile.js",
          () => ({
            default: { findOne: findOneMock },
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
            message: expect.any(String),
          })
        );
      });
    });
  });

  describe("createCitizenProfile", () => {
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
          expect.objectContaining({ success: false })
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
  });
});
