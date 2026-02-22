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

const helpRequestFindByIdMock = jest.fn();
const helpRequestFindByIdAndUpdateMock = jest.fn();
const helpRequestFindMock = jest.fn();
const helpRequestCountDocumentsMock = jest.fn();

await jest.unstable_mockModule("../../../models/HelpRequest.js", () => ({
  default: {
    findById: helpRequestFindByIdMock,
    findByIdAndUpdate: helpRequestFindByIdAndUpdateMock,
    find: helpRequestFindMock,
    countDocuments: helpRequestCountDocumentsMock,
  },
}));

const ngoFindByIdMock = jest.fn();
const ngoUpdateManyMock = jest.fn();

await jest.unstable_mockModule("../../../models/userProfileModel/NgoProfile.js", () => ({
  default: {
    findById: ngoFindByIdMock,
    updateMany: ngoUpdateManyMock,
  },
}));

const {
  updateHelpRequest,
  assignHelpRequest,
  rejectHelpRequest,
  verifyHelpRequest,
  resolveHelpRequest,
  getAdminHelpRequestById,
} = await import("../../../controllers/adminHelpController.js");

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

function createFindChain(result) {
  const chain = {
    sort: jest.fn(() => chain),
    skip: jest.fn(() => chain),
    limit: jest.fn(() => chain),
    populate: jest.fn().mockResolvedValue(result),
  };
  return chain;
}

describe("adminHelpController", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    objectIdIsValidMock.mockReturnValue(true);
  });

  describe("updateHelpRequest", () => {
    test("returns 400 for invalid id", async () => {
      objectIdIsValidMock.mockReturnValueOnce(false);

      const req = { params: { id: "bad" }, body: {} };
      const res = mockRes();

      await updateHelpRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid help request ID",
      });
    });

    test("rejects unsupported status values", async () => {
      helpRequestFindByIdMock.mockResolvedValue({ _id: "h1" });

      const req = { params: { id: "h1" }, body: { status: "weird" } };
      const res = mockRes();

      await updateHelpRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining("Invalid status"),
        })
      );
    });

    test("rejects assignment updates via updateHelpRequest", async () => {
      helpRequestFindByIdMock.mockResolvedValue({ _id: "h1" });

      const req = { params: { id: "h1" }, body: { assignedTo: "ngo1" } };
      const res = mockRes();

      await updateHelpRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Use the assign/unassign endpoints to modify assignments",
      });
    });
  });

  describe("assignHelpRequest", () => {
    test("rejects offline organizations", async () => {
      const helpRequest = { _id: "h1", save: jest.fn() };
      helpRequestFindByIdMock.mockResolvedValueOnce(helpRequest);

      ngoFindByIdMock.mockResolvedValue({
        approvalStatus: "approved",
        availabilityStatus: "OFFLINE",
      });

      const req = { params: { id: "h1" }, body: { organizationId: "ngo1" } };
      const res = mockRes();

      await assignHelpRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining("OFFLINE"),
          warning: true,
        })
      );
    });

    test("assigns and links organization when valid", async () => {
      const helpRequest = {
        _id: "h1",
        status: "pending",
        assignments: [],
        save: jest.fn(),
      };

      const ngo = {
        _id: "ngo1",
        approvalStatus: "approved",
        availabilityStatus: "AVAILABLE",
        assignedRequests: [],
        organizationName: "Org A",
        save: jest.fn(),
      };

      const populated = { _id: "h1", assignments: [{ ngoId: "ngo1" }] };
      const populateMock = jest.fn().mockResolvedValue(populated);

      helpRequestFindByIdMock
        .mockResolvedValueOnce(helpRequest)
        .mockReturnValueOnce({ populate: populateMock });

      ngoFindByIdMock.mockResolvedValue(ngo);

      const req = { params: { id: "h1" }, body: { organizationId: "ngo1" } };
      const res = mockRes();

      await assignHelpRequest(req, res);

      expect(helpRequest.assignments).toHaveLength(1);
      expect(helpRequest.status).toBe("assigned");
      expect(helpRequest.save).toHaveBeenCalled();
      expect(ngo.assignedRequests).toContain("h1");
      expect(ngo.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: populated,
        })
      );
    });
  });

  describe("resolveHelpRequest", () => {
    test("marks resolved and increments NGO completedTasks", async () => {
      const saveMock = jest.fn();
      const helpRequest = {
        _id: "h1",
        assignments: [{ ngoId: "ngo1" }],
        adminNotes: "",
        save: saveMock,
      };

      helpRequestFindByIdMock.mockResolvedValue(helpRequest);

      await resolveHelpRequest(
        { params: { id: "h1" }, body: { adminNotes: "done" } },
        mockRes()
      );

      expect(helpRequest.status).toBe("resolved");
      expect(helpRequest.adminNotes).toBe("done");
      expect(helpRequest.resolvedAt).toBeInstanceOf(Date);
      expect(saveMock).toHaveBeenCalled();
      expect(ngoUpdateManyMock).toHaveBeenCalledWith(
        { _id: { $in: ["ngo1"] } },
        { $inc: { completedTasks: 1 } }
      );
    });
  });

  describe("rejectHelpRequest", () => {
    test("requires rejection reason", async () => {
      const res = mockRes();
      const req = { params: { id: "h1" }, body: { reason: "" } };

      await rejectHelpRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Rejection reason is required",
      });
    });
  });

  describe("verifyHelpRequest", () => {
    test("only verifies pending requests", async () => {
      helpRequestFindByIdMock.mockResolvedValue({ status: "assigned" });

      const res = mockRes();
      await verifyHelpRequest({ params: { id: "h1" } }, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Cannot verify request with status: assigned",
      });
    });
  });

  describe("getAdminHelpRequestById", () => {
    test("returns 400 for invalid id", async () => {
      objectIdIsValidMock.mockReturnValueOnce(false);

      const res = mockRes();
      await getAdminHelpRequestById({ params: { id: "bad" } }, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid help request ID",
      });
    });

    test("returns populated request when found", async () => {
      const populateMock = jest.fn().mockResolvedValue({ _id: "h1" });
      helpRequestFindByIdMock.mockReturnValue({ populate: populateMock });

      const res = mockRes();
      await getAdminHelpRequestById({ params: { id: "h1" } }, res);

      expect(populateMock).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { _id: "h1" },
      });
    });
  });

  describe("getAdminHelpRequests", () => {
    test("supports unassigned filter", async () => {
      helpRequestFindMock.mockReturnValue(createFindChain([]));
      helpRequestCountDocumentsMock.mockResolvedValue(0);

      const res = mockRes();
      await (await import("../../../controllers/adminHelpController.js")).getAdminHelpRequests({
        query: { assignedTo: "unassigned", page: 1, limit: 10 },
      }, res);

      expect(helpRequestFindMock).toHaveBeenCalledWith({ assignments: { $size: 0 } });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          pagination: expect.objectContaining({ total: 0 }),
        })
      );
    });
  });
});