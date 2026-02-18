import { jest } from "@jest/globals";

const userFindByIdMock = jest.fn();
await jest.unstable_mockModule("../../../models/user.js", () => ({
  default: { findById: userFindByIdMock },
}));

const volunteerFindOneAndUpdateMock = jest.fn();
await jest.unstable_mockModule("../../../models/userProfileModel/VolunteerProfile.js", () => ({
  default: { findOneAndUpdate: volunteerFindOneAndUpdateMock },
}));

const ngoFindOneAndUpdateMock = jest.fn();
await jest.unstable_mockModule("../../../models/userProfileModel/NgoProfile.js", () => ({
  default: { findOneAndUpdate: ngoFindOneAndUpdateMock },
}));


const { verifyVolunteer, verifyNgo } = await import("../../../controllers/userManagementController/adminUserController.js"); // <-- adjust

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

    expect(ngoFindOneAndUpdateMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
