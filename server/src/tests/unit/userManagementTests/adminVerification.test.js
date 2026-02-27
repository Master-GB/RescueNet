import { jest } from "@jest/globals";

const userFindByIdMock = jest.fn();
await jest.unstable_mockModule("../../../models/user.js", () => ({
  default: { findById: userFindByIdMock },
}));

const volunteerFindOneAndUpdateMock = jest.fn();
const volunteerFindOneAndDeleteMock = jest.fn();
await jest.unstable_mockModule("../../../models/userProfileModel/VolunteerProfile.js", () => ({
  default: { 
    findOneAndUpdate: volunteerFindOneAndUpdateMock,
    findOneAndDelete: volunteerFindOneAndDeleteMock 
  },
}));

const ngoFindOneAndUpdateMock = jest.fn();
const ngoFindOneAndDeleteMock = jest.fn();
await jest.unstable_mockModule("../../../models/userProfileModel/NgoProfile.js", () => ({
  default: { 
    findOneAndUpdate: ngoFindOneAndUpdateMock,
    findOneAndDelete: ngoFindOneAndDeleteMock 
  },
}));


const citizenFindOneAndDeleteMock = jest.fn();
await jest.unstable_mockModule("../../../models/userProfileModel/CitizenProfile.js", () => ({
  default: { findOneAndDelete: citizenFindOneAndDeleteMock },
}));

const userFindByIdAndDeleteMock = jest.fn();
await jest.unstable_mockModule("../../../models/user.js", () => ({
  default: { 
    findById: userFindByIdMock,
    findByIdAndDelete: userFindByIdAndDeleteMock 
  },
}));

const { verifyVolunteer, verifyNgo, deleteUserAccount } = await import("../../../controllers/userManagementController/adminUserController.js");

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("Admin Verification Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("verifyVolunteer should return 400 if user not found or role mismatch", async () => {
    userFindByIdMock.mockResolvedValue({ _id: "u1", role: "CITIZEN" });

    const req = { params: { userId: "u1" } };
    const res = mockRes();

    await verifyVolunteer(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("verifyVolunteer should verify volunteer profile and return 200", async () => {
    userFindByIdMock.mockResolvedValue({ _id: "u2", role: "VOLUNTEER" });
    volunteerFindOneAndUpdateMock.mockResolvedValue({
      userId: "u2",
      verifiedByAdmin: true,
    });

    const req = { params: { userId: "u2" } };
    const res = mockRes();

    await verifyVolunteer(req, res);

    expect(volunteerFindOneAndUpdateMock).toHaveBeenCalledWith(
      { userId: "u2" },
      { $set: { verifiedByAdmin: true } },
      expect.objectContaining({ returnDocument: "after" })
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  test("verifyNgo should return 400 if role mismatch", async () => {
    userFindByIdMock.mockResolvedValue({ _id: "u3", role: "VOLUNTEER" });

    const req = { params: { userId: "u3" } };
    const res = mockRes();

    await verifyNgo(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("verifyNgo should verify NGO profile and return 200", async () => {
    userFindByIdMock.mockResolvedValue({ _id: "u4", role: "NGO" });
    ngoFindOneAndUpdateMock.mockResolvedValue({
      userId: "u4",
      verifiedByAdmin: true,
    });

    const req = { params: { userId: "u4" } };
    const res = mockRes();

    await verifyNgo(req, res);

    expect(ngoFindOneAndUpdateMock).toHaveBeenCalledWith(
      { userId: "u4" },
      { $set: { verifiedByAdmin: true } },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  test("verifyVolunteer should handle database errors", async () => {
    userFindByIdMock.mockRejectedValue(new Error("Database error"));

    const req = { params: { userId: "u1" } };
    const res = mockRes();

    await verifyVolunteer(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Verification failed",
        error: "Database error",
      })
    );
  });

  test("verifyNgo should handle database errors", async () => {
    userFindByIdMock.mockRejectedValue(new Error("Database error"));

    const req = { params: { userId: "u3" } };
    const res = mockRes();

    await verifyNgo(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Verification failed",
        error: "Database error",
      })
    );
  });

  // deleteUserAccount tests
  test("deleteUserAccount should return 400 if userId is missing", async () => {
    const req = { params: {} };
    const res = mockRes();

    await deleteUserAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "User ID is required",
      })
    );
  });

  test("deleteUserAccount should return 404 if user not found", async () => {
    userFindByIdMock.mockResolvedValue(null);

    const req = { params: { userId: "nonexistent" } };
    const res = mockRes();

    await deleteUserAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "User not found",
      })
    );
  });

  test("deleteUserAccount should return 400 if admin tries to delete themselves", async () => {
    const adminUser = { _id: "admin123", role: "ADMIN" };
    userFindByIdMock.mockResolvedValue(adminUser);

    const req = { params: { userId: "admin123" }, user: { _id: "admin123" } };
    const res = mockRes();

    await deleteUserAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Admin cannot delete their own account",
      })
    );
  });

  test("deleteUserAccount should return 403 if trying to delete another admin", async () => {
    const adminUser = { _id: "admin123", role: "ADMIN" };
    const requestingAdmin = { _id: "admin456" };
    userFindByIdMock.mockResolvedValue(adminUser);

    const req = { params: { userId: "admin123" }, user: requestingAdmin };
    const res = mockRes();

    await deleteUserAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Cannot delete another admin account",
      })
    );
  });

  test("deleteUserAccount should delete citizen and their profile", async () => {
    const citizenUser = { _id: "citizen123", role: "CITIZEN" };
    userFindByIdMock.mockResolvedValue(citizenUser);
    citizenFindOneAndDeleteMock.mockResolvedValue({ userId: "citizen123" });
    userFindByIdAndDeleteMock.mockResolvedValue(citizenUser);

    const req = { params: { userId: "citizen123" }, user: { _id: "admin456" } };
    const res = mockRes();

    await deleteUserAccount(req, res);

    expect(citizenFindOneAndDeleteMock).toHaveBeenCalledWith({ userId: "citizen123" });
    expect(userFindByIdAndDeleteMock).toHaveBeenCalledWith("citizen123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "User account and profile deleted successfully",
      })
    );
  });

  test("deleteUserAccount should delete volunteer and their profile", async () => {
    const volunteerUser = { _id: "volunteer123", role: "VOLUNTEER" };
    userFindByIdMock.mockResolvedValue(volunteerUser);
    volunteerFindOneAndDeleteMock.mockResolvedValue({ userId: "volunteer123" });
    userFindByIdAndDeleteMock.mockResolvedValue(volunteerUser);

    const req = { params: { userId: "volunteer123" }, user: { _id: "admin456" } };
    const res = mockRes();

    await deleteUserAccount(req, res);

    expect(volunteerFindOneAndDeleteMock).toHaveBeenCalledWith({ userId: "volunteer123" });
    expect(userFindByIdAndDeleteMock).toHaveBeenCalledWith("volunteer123");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("deleteUserAccount should delete NGO and their profile", async () => {
    const ngoUser = { _id: "ngo123", role: "NGO" };
    userFindByIdMock.mockResolvedValue(ngoUser);
    ngoFindOneAndDeleteMock.mockResolvedValue({ userId: "ngo123" });
    userFindByIdAndDeleteMock.mockResolvedValue(ngoUser);

    const req = { params: { userId: "ngo123" }, user: { _id: "admin456" } };
    const res = mockRes();

    await deleteUserAccount(req, res);

    expect(ngoFindOneAndDeleteMock).toHaveBeenCalledWith({ userId: "ngo123" });
    expect(userFindByIdAndDeleteMock).toHaveBeenCalledWith("ngo123");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("deleteUserAccount should handle unknown role gracefully", async () => {
    const unknownUser = { _id: "unknown123", role: "UNKNOWN" };
    userFindByIdMock.mockResolvedValue(unknownUser);
    userFindByIdAndDeleteMock.mockResolvedValue(unknownUser);

    const req = { params: { userId: "unknown123" }, user: { _id: "admin456" } };
    const res = mockRes();

    await deleteUserAccount(req, res);

    expect(userFindByIdAndDeleteMock).toHaveBeenCalledWith("unknown123");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("deleteUserAccount should handle database errors", async () => {
    userFindByIdMock.mockRejectedValue(new Error("Database error"));

    const req = { params: { userId: "user123" }, user: { _id: "admin456" } };
    const res = mockRes();

    await deleteUserAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Delete user failed",
        error: "Database error",
      })
    );
  });
});
