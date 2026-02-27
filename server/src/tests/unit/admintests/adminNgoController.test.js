import { jest } from "@jest/globals";

// ---- Mocks ----
const objectIdIsValidMock = jest.fn();

await jest.unstable_mockModule("mongoose", () => ({
  default: {
    Types: {
      ObjectId: {
        isValid: objectIdIsValidMock,
      },
    },
  },
}));

const ngoFindOneMock = jest.fn();
const ngoCreateMock = jest.fn();
const ngoFindByIdMock = jest.fn();
const ngoFindByIdAndUpdateMock = jest.fn();
const ngoFindByIdAndDeleteMock = jest.fn();

await jest.unstable_mockModule("../../../models/userProfileModel/NgoProfile.js", () => ({
  default: {
    findOne: ngoFindOneMock,
    create: ngoCreateMock,
    findById: ngoFindByIdMock,
    findByIdAndUpdate: ngoFindByIdAndUpdateMock,
    findByIdAndDelete: ngoFindByIdAndDeleteMock,
  },
}));

const userFindOneMock = jest.fn();
const userFindByIdMock = jest.fn();

await jest.unstable_mockModule("../../../models/user.js", () => ({
  default: {
    findOne: userFindOneMock,
    findById: userFindByIdMock,
  },
}));

const helpRequestFindMock = jest.fn();
const helpRequestUpdateManyMock = jest.fn();

await jest.unstable_mockModule("../../../models/HelpRequest.js", () => ({
  default: {
    find: helpRequestFindMock,
    updateMany: helpRequestUpdateManyMock,
  },
}));

const {
  registerNgo,
  updateNgo,
  deleteNgo,
} = await import("../../../controllers/adminNgoController.js");

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("adminNgoController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    objectIdIsValidMock.mockReturnValue(true);
  });

  describe("registerNgo", () => {
    test("validates required fields", async () => {
      const res = mockRes();

      await registerNgo({ body: { registrationNumber: "r1", contactPhone: "1" } }, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "userEmail is required.",
      });
    });

    test("returns 404 when user not found", async () => {
      userFindOneMock.mockResolvedValue(null);

      const res = mockRes();
      await registerNgo(
        {
          body: {
            userEmail: "ngo@test.com",
            organizationName: "Org",
            registrationNumber: "r1",
            contactPhone: "123",
          },
          user: { _id: "admin" },
        },
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    test("creates ngo and updates user role", async () => {
      const userSaveMock = jest.fn();
      userFindOneMock.mockResolvedValue({
        _id: "u1",
        role: "CITIZEN",
        save: userSaveMock,
        email: "ngo@test.com",
      });

      ngoFindOneMock
        .mockResolvedValueOnce(null) // existing ngo by user
        .mockResolvedValueOnce(null); // duplicate registration

      const createdNgo = { _id: "ngo1" };
      ngoCreateMock.mockResolvedValue(createdNgo);

      const res = mockRes();

      await registerNgo(
        {
          body: {
            userEmail: "ngo@test.com",
            organizationName: "Org",
            registrationNumber: "r1",
            contactPhone: "123",
          },
          user: { _id: "admin" },
        },
        res
      );

      expect(ngoCreateMock).toHaveBeenCalled();
      expect(userSaveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ ngo: createdNgo, userRole: "NGO" }),
        })
      );
    });
  });

  describe("updateNgo", () => {
    test("rejects invalid ids", async () => {
      objectIdIsValidMock.mockReturnValueOnce(false);

      const res = mockRes();
      await updateNgo({ params: { id: "bad" }, body: {} }, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid NGO ID",
      });
    });

    test("prevents duplicate registration numbers", async () => {
      ngoFindByIdMock.mockResolvedValue({ _id: "ngo1", registrationNumber: "old" });
      ngoFindOneMock.mockResolvedValue({ _id: "ngo2" });

      const res = mockRes();
      await updateNgo(
        { params: { id: "ngo1" }, body: { registrationNumber: "dup" }, user: { _id: "admin" } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Organization with this registration number already exists.",
      });
    });
  });

  describe("deleteNgo", () => {
    test("rejects invalid id", async () => {
      objectIdIsValidMock.mockReturnValueOnce(false);

      const res = mockRes();
      await deleteNgo({ params: { id: "bad" } }, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid NGO ID",
      });
    });

    test("unassigns help requests and resets user role", async () => {
      const userSaveMock = jest.fn();
      ngoFindByIdMock.mockResolvedValue({ _id: "ngo1", userId: "u1" });
      userFindByIdMock.mockResolvedValue({ role: "NGO", save: userSaveMock });

      helpRequestFindMock.mockResolvedValue([{ _id: "h1" }]);
      helpRequestUpdateManyMock.mockResolvedValue({});
      ngoFindByIdAndDeleteMock.mockResolvedValue({});

      const res = mockRes();
      await deleteNgo({ params: { id: "ngo1" } }, res);

      expect(helpRequestUpdateManyMock).toHaveBeenNthCalledWith(
        1,
        { _id: { $in: ["h1"] } },
        { $pull: { assignments: { ngoId: "ngo1" } } }
      );
      expect(helpRequestUpdateManyMock).toHaveBeenNthCalledWith(
        2,
        { _id: { $in: ["h1"] }, assignments: { $size: 0 }, status: "assigned" },
        { $set: { status: "verified" } }
      );
      expect(userSaveMock).toHaveBeenCalled();
      expect(ngoFindByIdAndDeleteMock).toHaveBeenCalledWith("ngo1");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "NGO deleted successfully",
        data: { id: "ngo1" },
      });
    });
  });
});