import { jest } from "@jest/globals";

/**
 * Mocks
 */
const ngoFindOneMock = jest.fn();
const ngoCreateMock = jest.fn();
const ngoFindOneAndUpdateMock = jest.fn();
const ngoFindOneAndDeleteMock = jest.fn();

await jest.unstable_mockModule("../../../models/userProfileModel/NgoProfile.js", () => ({
  default: {
    findOne: ngoFindOneMock,
    create: ngoCreateMock,
    findOneAndUpdate: ngoFindOneAndUpdateMock,
    findOneAndDelete: ngoFindOneAndDeleteMock,
  },
}));

const userFindByIdMock = jest.fn();
const userFindByIdAndDeleteMock = jest.fn();

await jest.unstable_mockModule("../../../models/user.js", () => ({
  default: {
    findById: userFindByIdMock,
    findByIdAndDelete: userFindByIdAndDeleteMock,
  },
}));

/**
 * ✅ Import controller AFTER mocks
 */
const {
  createNgoProfile,
  getNgoProfile,
  updateNgoProfile,
  updateAvailabilityStatus,
  deleteNgoProfile,
} = await import("../../../controllers/userManagementController/ngoProfileController.js");

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.clearCookie = jest.fn(() => res);
  return res;
}

describe("NGO Profile Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = "development";
  });

  // -------------------------
  // createNgoProfile
  // -------------------------
  describe("createNgoProfile", () => {
    test("should return 409 if profile exists", async () => {
      ngoFindOneMock.mockResolvedValue({ _id: "p1" });

      const req = {
        user: { _id: "u1" },
        body: { registrationNumber: "R1", contactPhone: "+9411" },
      };
      const res = mockRes();

      await createNgoProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "NGO profile already exists",
      });
    });

    test("should return 400 if required fields missing", async () => {
      ngoFindOneMock.mockResolvedValue(null);

      const req = { user: { _id: "u1" }, body: { contactPhone: "+9411" } };
      const res = mockRes();

      await createNgoProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Missing required fields: registrationNumber and contactPhone",
        })
      );
    });

    test("should create profile and return 201", async () => {
      ngoFindOneMock.mockResolvedValue(null);
      ngoCreateMock.mockResolvedValue({ _id: "p1", userId: "u1" });

      const req = {
        user: { _id: "u1" },
        body: {
          registrationNumber: "REG-123",
          contactPhone: "+9411222333",
          serviceDistricts: "Colombo",
          availabilityStatus: "OFFLINE",
          services: ["FOOD"],
        },
      };
      const res = mockRes();

      await createNgoProfile(req, res);

      expect(ngoCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "u1",
          registrationNumber: "REG-123",
          contactPhone: "+9411222333",
          verifiedByAdmin: false,
        })
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "NGO profile created successfully",
        })
      );
    });
  });

  // -------------------------
  // getNgoProfile
  // -------------------------
  describe("getNgoProfile", () => {
    test("should return 404 if user not found", async () => {
      userFindByIdMock.mockResolvedValue(null);

      const req = { user: { _id: "u1" } };
      const res = mockRes();

      await getNgoProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found",
      });
    });

    test("should return 404 if profile not found", async () => {
      userFindByIdMock.mockResolvedValue({ name: "Ngo", email: "n@x.com" });
      ngoFindOneMock.mockResolvedValue(null);

      const req = { user: { _id: "u1" } };
      const res = mockRes();

      await getNgoProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "NGO profile not found",
      });
    });

    test("should return merged profileData with name and email", async () => {
      userFindByIdMock.mockResolvedValue({ name: "Ngo", email: "n@x.com" });
      ngoFindOneMock.mockResolvedValue({
        toObject: () => ({ userId: "u1", registrationNumber: "REG" }),
      });

      const req = { user: { _id: "u1" } };
      const res = mockRes();

      await getNgoProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "NGO profile retrieved",
          profileData: expect.objectContaining({
            name: "Ngo",
            email: "n@x.com",
            registrationNumber: "REG",
          }),
        })
      );
    });
  });

  // -------------------------
  // updateNgoProfile
  // -------------------------
  describe("updateNgoProfile", () => {
    test("should return 404 if profile not found", async () => {
      ngoFindOneAndUpdateMock.mockResolvedValue(null);

      const req = { user: { _id: "u1" }, body: { contactPhone: "+9411" } };
      const res = mockRes();

      await updateNgoProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "NGO profile not found",
      });
    });

    test("should update and return 200", async () => {
      ngoFindOneAndUpdateMock.mockResolvedValue({
        userId: "u1",
        contactPhone: "+9411",
      });

      const req = { user: { _id: "u1" }, body: { contactPhone: "+9411" } };
      const res = mockRes();

      await updateNgoProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Profile updated successfully",
        })
      );
    });
  });

  // -------------------------
  // updateAvailabilityStatus
  // -------------------------
  describe("updateAvailabilityStatus (NGO)", () => {
    test("should return 400 for invalid status", async () => {
      const req = { user: { _id: "u1" }, body: { availabilityStatus: "WRONG" } };
      const res = mockRes();

      await updateAvailabilityStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return 404 if profile not found", async () => {
      ngoFindOneAndUpdateMock.mockResolvedValue(null);

      const req = { user: { _id: "u1" }, body: { availabilityStatus: "AVAILABLE" } };
      const res = mockRes();

      await updateAvailabilityStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "NGO profile not found",
      });
    });

    test("should update status and return 200", async () => {
      ngoFindOneAndUpdateMock.mockResolvedValue({
        userId: "u1",
        availabilityStatus: "AVAILABLE",
      });

      const req = { user: { _id: "u1" }, body: { availabilityStatus: "AVAILABLE" } };
      const res = mockRes();

      await updateAvailabilityStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Status updated successfully",
        })
      );
    });
  });

  // -------------------------
  // deleteNgoProfile
  // -------------------------
  describe("deleteNgoProfile", () => {
    test("should return 404 if user not found", async () => {
      userFindByIdAndDeleteMock.mockResolvedValue(null);

      const req = { user: { _id: "u1" } };
      const res = mockRes();

      await deleteNgoProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found",
      });
    });

    test("should return 404 if profile not found", async () => {
      userFindByIdAndDeleteMock.mockResolvedValue({ _id: "u1" });
      ngoFindOneAndDeleteMock.mockResolvedValue(null);

      const req = { user: { _id: "u1" } };
      const res = mockRes();

      await deleteNgoProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "NGO profile not found",
      });
    });

    test("should delete user + profile, clear cookie, return 200", async () => {
      userFindByIdAndDeleteMock.mockResolvedValue({ _id: "u1" });
      ngoFindOneAndDeleteMock.mockResolvedValue({ userId: "u1" });

      const req = { user: { _id: "u1" } };
      const res = mockRes();

      await deleteNgoProfile(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith(
        "access_token",
        expect.objectContaining({ httpOnly: true })
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Profile deleted successfully",
      });
    });
  });
});
