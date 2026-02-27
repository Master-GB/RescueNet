import { jest } from "@jest/globals";

/**
 * Mocks
 */
const volunteerFindOneMock = jest.fn();
const volunteerCreateMock = jest.fn();
const volunteerFindOneAndUpdateMock = jest.fn();
const volunteerFindOneAndDeleteMock = jest.fn();

await jest.unstable_mockModule("../../../models/userProfileModel/VolunteerProfile.js", () => ({
  default: {
    findOne: volunteerFindOneMock,
    create: volunteerCreateMock,
    findOneAndUpdate: volunteerFindOneAndUpdateMock,
    findOneAndDelete: volunteerFindOneAndDeleteMock,
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
  createVolunteerProfile,
  getVolunteerProfile,
  updateVolunteerProfile,
  updateAvailabilityStatus,
  deleteVolunteerProfile,
} = await import("../../../controllers/userManagementController/volunteerProfileController.js"); 

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.clearCookie = jest.fn(() => res);
  return res;
}

describe("Volunteer Profile Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = "development";
  });

  // -------------------------
  // createVolunteerProfile
  // -------------------------
  describe("createVolunteerProfile", () => {
    test("should return 400 if phone missing", async () => {
      volunteerFindOneMock.mockResolvedValue(null);

      const req = { user: { _id: "u1" }, body: { skills: [] } };
      const res = mockRes();

      await createVolunteerProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Missing required field: phone",
      });
    });

    test("should return 409 if profile already exists", async () => {
      volunteerFindOneMock.mockResolvedValue({ _id: "p1" });

      const req = { user: { _id: "u1" }, body: { phone: "+94770000000" } };
      const res = mockRes();

      await createVolunteerProfile(req, res);

      expect(volunteerFindOneMock).toHaveBeenCalledWith({ userId: "u1" });
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Volunteer profile already exists",
      });
    });

    test("should create profile and return 201", async () => {
      volunteerFindOneMock.mockResolvedValue(null);
      volunteerCreateMock.mockResolvedValue({
        _id: "p1",
        userId: "u1",
        phone: "+94770000000",
      });

      const req = {
        user: { _id: "u1" },
        body: {
          phone: "+94770000000",
          skills: ["FIRST_AID"],
          serviceDistricts: ["Colombo"],
          availabilityStatus: "OFFLINE",
        },
      };
      const res = mockRes();

      await createVolunteerProfile(req, res);

      expect(volunteerCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "u1",
          phone: "+94770000000",
          verifiedByAdmin: false,
        })
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Volunteer profile created successfully",
        })
      );
    });

    test("should return 500 if create throws error", async () => {
      volunteerFindOneMock.mockResolvedValue(null);
      volunteerCreateMock.mockRejectedValue(new Error("DB error"));

      const req = { user: { _id: "u1" }, body: { phone: "+9477" } };
      const res = mockRes();

      await createVolunteerProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });

  // -------------------------
  // getVolunteerProfile
  // -------------------------
  describe("getVolunteerProfile", () => {
    test("should return 404 if profile not found", async () => {
      volunteerFindOneMock.mockResolvedValue(null);

      const req = { user: { _id: "u1" } };
      const res = mockRes();

      await getVolunteerProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Volunteer profile not found",
      });
    });

    test("should return 404 if user not found", async () => {
      volunteerFindOneMock.mockResolvedValue({
        toObject: () => ({ userId: "u1", phone: "+9477" }),
      });
      userFindByIdMock.mockResolvedValue(null);

      const req = { user: { _id: "u1" } };
      const res = mockRes();

      await getVolunteerProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found",
      });
    });

    test("should return merged profileData with name and email", async () => {
      volunteerFindOneMock.mockResolvedValue({
        toObject: () => ({ userId: "u1", phone: "+9477" }),
      });
      userFindByIdMock.mockResolvedValue({ name: "Kamal", email: "a@b.com" });

      const req = { user: { _id: "u1" } };
      const res = mockRes();

      await getVolunteerProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Volunteer profile retrieved",
          profileData: expect.objectContaining({
            name: "Kamal",
            email: "a@b.com",
            phone: "+9477",
          }),
        })
      );
    });
  });

  // -------------------------
  // updateVolunteerProfile
  // -------------------------
  describe("updateVolunteerProfile", () => {
    test("should return 404 if profile not found", async () => {
      volunteerFindOneAndUpdateMock.mockResolvedValue(null);

      const req = { user: { _id: "u1" }, body: { phone: "+9476" } };
      const res = mockRes();

      await updateVolunteerProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Volunteer profile not found",
      });
    });

    test("should update and return 200", async () => {
      volunteerFindOneAndUpdateMock.mockResolvedValue({
        userId: "u1",
        phone: "+9476",
      });

      const req = { user: { _id: "u1" }, body: { phone: "+9476" } };
      const res = mockRes();

      await updateVolunteerProfile(req, res);

      expect(volunteerFindOneAndUpdateMock).toHaveBeenCalledWith(
        { userId: "u1" },
        { $set: { phone: "+9476" } },
        expect.objectContaining({ returnDocument: "after", runValidators: true })
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, profile: { userId: "u1", phone: "+9476" } })
      );
    });
  });

  // -------------------------
  // updateAvailabilityStatus
  // -------------------------
  describe("updateAvailabilityStatus", () => {
    test("should return 400 for invalid status", async () => {
      const req = { user: { _id: "u1" }, body: { availabilityStatus: "WRONG" } };
      const res = mockRes();

      await updateAvailabilityStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    test("should return 404 if profile not found", async () => {
      volunteerFindOneAndUpdateMock.mockResolvedValue(null);

      const req = { user: { _id: "u1" }, body: { availabilityStatus: "AVAILABLE" } };
      const res = mockRes();

      await updateAvailabilityStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Volunteer profile not found",
      });
    });

    test("should update status and return 200", async () => {
      volunteerFindOneAndUpdateMock.mockResolvedValue({
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
  // deleteVolunteerProfile
  // -------------------------
  describe("deleteVolunteerProfile", () => {
    test("should return 404 if user not found", async () => {
      userFindByIdAndDeleteMock.mockResolvedValue(null);

      const req = { user: { _id: "u1" } };
      const res = mockRes();

      await deleteVolunteerProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found",
      });
    });

    test("should return 404 if profile not found", async () => {
      userFindByIdAndDeleteMock.mockResolvedValue({ _id: "u1" });
      volunteerFindOneAndDeleteMock.mockResolvedValue(null);

      const req = { user: { _id: "u1" } };
      const res = mockRes();

      await deleteVolunteerProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Volunteer profile not found",
      });
    });

    test("should delete user + profile, clear cookie, return 200", async () => {
      userFindByIdAndDeleteMock.mockResolvedValue({ _id: "u1" });
      volunteerFindOneAndDeleteMock.mockResolvedValue({ userId: "u1" });

      const req = { user: { _id: "u1" } };
      const res = mockRes();

      await deleteVolunteerProfile(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith(
        "access_token",
        expect.objectContaining({ httpOnly: true })
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Volunteer profile deleted successfully",
      });
    });
  });
});
