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

// Test suite for adminHelpController
describe("adminHelpController", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
    objectIdIsValidMock.mockReturnValue(true);
  });

  // Tests for updateHelpRequest controller
  describe("updateHelpRequest", () => {
    // Test: Should return 400 for invalid help request ID
    test("returns 400 for invalid id", async () => {
      objectIdIsValidMock.mockReturnValueOnce(false);

      // Setup request and response mocks
      const req = { params: { id: "bad" }, body: {} };
      const res = mockRes();

      // Call controller
      await updateHelpRequest(req, res);

      // Assert response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid help request ID",
      });
    });

    // Test: Should reject unsupported status values
    test("rejects unsupported status values", async () => {
      helpRequestFindByIdMock.mockResolvedValue({ _id: "h1" });

      // Setup request with invalid status
      const req = { params: { id: "h1" }, body: { status: "weird" } };
      const res = mockRes();

      // Call controller
      await updateHelpRequest(req, res);

      // Assert response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining("Invalid status"),
        })
      );
    });

    // Test: Should reject assignment updates via updateHelpRequest
    test("rejects assignment updates via updateHelpRequest", async () => {
      helpRequestFindByIdMock.mockResolvedValue({ _id: "h1" });

      // Setup request with assignment field
      const req = { params: { id: "h1" }, body: { assignedTo: "ngo1" } };
      const res = mockRes();

      // Call controller
      await updateHelpRequest(req, res);

      // Assert response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Use the assign/unassign endpoints to modify assignments",
      });
    });
  });

  // Tests for assignHelpRequest controller
  describe("assignHelpRequest", () => {
    // Test: Should reject assignment to offline organizations
    test("rejects offline organizations", async () => {
      // Setup help request and NGO mocks
      const helpRequest = { _id: "h1", save: jest.fn() };
      helpRequestFindByIdMock.mockResolvedValueOnce(helpRequest);

      ngoFindByIdMock.mockResolvedValue({
        approvalStatus: "approved",
        availabilityStatus: "OFFLINE",
      });

      // Setup request and response mocks
      const req = { params: { id: "h1" }, body: { organizationId: "ngo1" } };
      const res = mockRes();

      // Call controller
      await assignHelpRequest(req, res);

      // Assert response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining("OFFLINE"),
          warning: true,
        })
      );
    });

    // Test: Should assign and link organization when valid
    test("assigns and links organization when valid", async () => {
      // Setup help request and NGO mocks
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

      // Setup populated mock for response
      const populated = { _id: "h1", assignments: [{ ngoId: "ngo1" }] };
      const populateMock = jest.fn().mockResolvedValue(populated);

      helpRequestFindByIdMock
        .mockResolvedValueOnce(helpRequest)
        .mockReturnValueOnce({ populate: populateMock });

      ngoFindByIdMock.mockResolvedValue(ngo);

      // Setup request and response mocks
      const req = { params: { id: "h1" }, body: { organizationId: "ngo1" } };
      const res = mockRes();

      // Call controller
      await assignHelpRequest(req, res);

      // Assert help request and NGO updates
      expect(helpRequest.assignments).toHaveLength(1);
      expect(helpRequest.status).toBe("assigned");
      expect(helpRequest.save).toHaveBeenCalled();
      expect(ngo.assignedRequests).toContain("h1");
      expect(ngo.save).toHaveBeenCalled();
      // Assert response
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: populated,
        })
      );
    });
  });

  // Tests for resolveHelpRequest controller
  describe("resolveHelpRequest", () => {
    // Test: Should mark resolved and increment NGO completedTasks
    test("marks resolved and increments NGO completedTasks", async () => {
      // Setup help request with completed assignment
      const saveMock = jest.fn();
      const helpRequest = {
        _id: "h1",
        assignments: [{ ngoId: "ngo1", status: "completed" }],
        adminNotes: "",
        save: saveMock,
      };

      helpRequestFindByIdMock.mockResolvedValue(helpRequest);

      // Call controller
      await resolveHelpRequest(
        { params: { id: "h1" }, body: { adminNotes: "done" } },
        mockRes()
      );

      // Assert help request updates
      expect(helpRequest.status).toBe("resolved");
      expect(helpRequest.adminNotes).toBe("done");
      expect(helpRequest.resolvedAt).toBeInstanceOf(Date);
      expect(saveMock).toHaveBeenCalled();
      // Assert NGO completedTasks increment
      expect(ngoUpdateManyMock).toHaveBeenCalledWith(
        { _id: { $in: ["ngo1"] } },
        { $inc: { completedTasks: 1 } }
      );
    });

    // Test: Should not increment completedTasks for non-completed assignments
    test("does not increment completedTasks for non-completed assignments", async () => {
      // Setup help request with non-completed assignment
      const saveMock = jest.fn();
      const helpRequest = {
        _id: "h1",
        assignments: [{ ngoId: "ngo1", status: "assigned" }],
        adminNotes: "",
        save: saveMock,
      };

      helpRequestFindByIdMock.mockResolvedValue(helpRequest);

      // Call controller
      await resolveHelpRequest(
        { params: { id: "h1" }, body: { adminNotes: "done" } },
        mockRes()
      );

      // Assert NGO completedTasks not incremented
      expect(ngoUpdateManyMock).not.toHaveBeenCalled();
    });
  });

  // Tests for rejectHelpRequest controller
  describe("rejectHelpRequest", () => {
    // Test: Should require rejection reason
    test("requires rejection reason", async () => {
      // Setup request and response mocks
      const res = mockRes();
      const req = { params: { id: "h1" }, body: { reason: "" } };

      // Call controller
      await rejectHelpRequest(req, res);

      // Assert response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Rejection reason is required",
      });
    });
  });

  // Tests for verifyHelpRequest controller
  describe("verifyHelpRequest", () => {
    // Test: Should only verify pending requests
    test("only verifies pending requests", async () => {
      helpRequestFindByIdMock.mockResolvedValue({ status: "assigned" });

      // Setup response mock
      const res = mockRes();
      // Call controller
      await verifyHelpRequest({ params: { id: "h1" } }, res);

      // Assert response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Cannot verify request with status: assigned",
      });
    });
  });

  // Tests for getAdminHelpRequestById controller
  describe("getAdminHelpRequestById", () => {
    // Test: Should return 400 for invalid id
    test("returns 400 for invalid id", async () => {
      objectIdIsValidMock.mockReturnValueOnce(false);

      // Setup response mock
      const res = mockRes();
      // Call controller
      await getAdminHelpRequestById({ params: { id: "bad" } }, res);

      // Assert response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid help request ID",
      });
    });

    // Test: Should return populated request when found
    test("returns populated request when found", async () => {
      // Setup populate mock
      const populateMock = jest.fn().mockResolvedValue({ _id: "h1" });
      helpRequestFindByIdMock.mockReturnValue({ populate: populateMock });

      // Setup response mock
      const res = mockRes();
      // Call controller
      await getAdminHelpRequestById({ params: { id: "h1" } }, res);

      // Assert populate and response
      expect(populateMock).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { _id: "h1" },
      });
    });
  });

  // Tests for getAdminHelpRequests controller
  describe("getAdminHelpRequests", () => {
    // Test: Should support unassigned filter
    test("supports unassigned filter", async () => {
      // Setup find and count mocks
      helpRequestFindMock.mockReturnValue(createFindChain([]));
      helpRequestCountDocumentsMock.mockResolvedValue(0);

      // Setup response mock
      const res = mockRes();
      // Call controller
      await (await import("../../../controllers/adminHelpController.js")).getAdminHelpRequests({
        query: { assignedTo: "unassigned", page: 1, limit: 10 },
      }, res);

      // Assert filter and response
      expect(helpRequestFindMock).toHaveBeenCalledWith({ assignments: { $size: 0 } });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          pagination: expect.objectContaining({ total: 0 }),
        })
      );
    });
  });

  // Tests for assigning a help request to multiple NGOs
  describe("assignHelpRequest - multiple NGOs", () => {
    // Test: Should store each NGO assignment as a separate subdocument
    test("assigns help request to multiple NGOs and stores assignments as subdocuments", async () => {
      // Setup initial help request with no assignments
      const helpRequest = {
        _id: "h1",
        status: "pending",
        assignments: [],
        save: jest.fn(),
      };

      // Setup two NGO mocks — both approved and available
      const ngo1 = {
        _id: "ngo1",
        approvalStatus: "approved",
        availabilityStatus: "AVAILABLE",
        assignedRequests: [],
        organizationName: "Org 1",
        save: jest.fn(),
      };
      const ngo2 = {
        _id: "ngo2",
        approvalStatus: "approved",
        availabilityStatus: "AVAILABLE",
        assignedRequests: [],
        organizationName: "Org 2",
        save: jest.fn(),
      };

      // Setup populated mock responses for each assignment
      const populated1 = { _id: "h1", assignments: [{ ngoId: "ngo1" }] };
      const populated2 = { _id: "h1", assignments: [{ ngoId: "ngo1" }, { ngoId: "ngo2" }] };
      const populateMock1 = jest.fn().mockResolvedValue(populated1);
      const populateMock2 = jest.fn().mockResolvedValue(populated2);

      // First assignment: assign to ngo1
      helpRequestFindByIdMock
        .mockResolvedValueOnce(helpRequest)
        .mockReturnValueOnce({ populate: populateMock1 });
      ngoFindByIdMock.mockResolvedValueOnce(ngo1);

      let req = { params: { id: "h1" }, body: { organizationId: "ngo1" } };
      let res = mockRes();
      await assignHelpRequest(req, res);

      // After first assignment, helpRequest.assignments should contain ngo1
      expect(helpRequest.assignments).toHaveLength(1);
      expect(helpRequest.assignments[0].ngoId).toBe("ngo1");

      // Second assignment: assign to ngo2 (helpRequest already has ngo1 assignment)
      helpRequestFindByIdMock
        .mockResolvedValueOnce(helpRequest)
        .mockReturnValueOnce({ populate: populateMock2 });
      ngoFindByIdMock.mockResolvedValueOnce(ngo2);

      req = { params: { id: "h1" }, body: { organizationId: "ngo2" } };
      res = mockRes();
      await assignHelpRequest(req, res);

      // After second assignment, helpRequest.assignments should contain both ngo1 and ngo2
      expect(helpRequest.assignments).toHaveLength(2);
      const ngoIds = helpRequest.assignments.map((a) => a.ngoId);
      expect(ngoIds).toContain("ngo1");
      expect(ngoIds).toContain("ngo2");

      // Each assignment subdocument should have the required fields set by the controller
      // Note: assignedAt is a schema default and won't be present in plain JS mock objects
      helpRequest.assignments.forEach((assignment) => {
        expect(assignment).toHaveProperty("ngoId");
        expect(assignment).toHaveProperty("status", "assigned");
        expect(assignment).toHaveProperty("taskType", "General Relief");
      });

      // Both NGOs should have the help request tracked in their assignedRequests
      expect(ngo1.assignedRequests).toContain("h1");
      expect(ngo2.assignedRequests).toContain("h1");
    });
  });
});