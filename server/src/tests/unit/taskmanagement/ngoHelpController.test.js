import { jest } from "@jest/globals";

// ---------------------------------------------------------------------------
// Module mocks must be declared BEFORE any import of the controller
// ---------------------------------------------------------------------------

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

// NgoProfile stubs
const ngoFindOneMock = jest.fn();
const ngoSaveMock = jest.fn();

await jest.unstable_mockModule(
  "../../../models/userProfileModel/NgoProfile.js",
  () => ({
    default: {
      findOne: ngoFindOneMock,
    },
  })
);

// HelpRequest stubs
const helpFindMock = jest.fn();
const helpFindOneMock = jest.fn();
const helpFindByIdMock = jest.fn();
const helpCountDocumentsMock = jest.fn();
const helpAggregateMock = jest.fn();

await jest.unstable_mockModule("../../../models/HelpRequest.js", () => ({
  default: {
    find: helpFindMock,
    findOne: helpFindOneMock,
    findById: helpFindByIdMock,
    countDocuments: helpCountDocumentsMock,
    aggregate: helpAggregateMock,
  },
}));

// ---------------------------------------------------------------------------
// Import controller after mocks are registered
// ---------------------------------------------------------------------------
const {
  getMyTasks,
  getPerformance,
  getTaskDetail,
  acceptTask,
  declineTask,
  markInProgress,
  markCompleted,
} = await import("../../../controllers/ngoHelpController.js");

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Build a mock Express response object that records calls. */
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

/** Build a mock req with sensible defaults. */
function mockReq(overrides = {}) {
  return {
    user: { _id: NGO_USER_ID },
    params: {},
    query: {},
    body: {},
    ...overrides,
  };
}

/** Returns a chainable find query mock finishing with .select() */
function buildFindChain(result) {
  const chain = {
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    select: jest.fn().mockResolvedValue(result),
  };
  chain.sort.mockReturnValue(chain);
  chain.skip.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  return chain;
}

// Fixed IDs shared across tests
const NGO_USER_ID = "user-abc-001";
const NGO_PROFILE_ID = "ngoProfile-001";
const REQUEST_ID = "helpReq-001";

/**
 * Returns a mock NgoProfile that passes the approval gate.
 * All fields needed by the controller are present.
 */
function approvedProfile(overrides = {}) {
  return {
    _id: NGO_PROFILE_ID,
    userId: NGO_USER_ID,
    approvalStatus: "approved",
    completedTasks: 0,
    averageResponseTime: undefined,
    rating: 4.5,
    availabilityStatus: "AVAILABLE",
    acceptedRequests: [],
    save: ngoSaveMock,
    ...overrides,
  };
}

/**
 * Returns a minimal mock HelpRequest with one assignment belonging to the
 * default NGO profile.  Pass assignmentOverrides / requestOverrides to
 * customise individual fields.
 */
function helpRequest(assignmentOverrides = {}, requestOverrides = {}) {
  const saveMock = jest.fn().mockResolvedValue(true);
  return {
    _id: REQUEST_ID,
    status: "assigned",
    assignments: [
      {
        ngoId: { toString: () => NGO_PROFILE_ID },
        status: "assigned",
        declineReason: undefined,
        completedAt: undefined,
        ...assignmentOverrides,
      },
    ],
    resolvedAt: undefined,
    save: saveMock,
    ...requestOverrides,
  };
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe("ngoHelpController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: every ObjectId is valid
    objectIdIsValidMock.mockReturnValue(true);
    // Default: profile save succeeds
    ngoSaveMock.mockResolvedValue(true);
  });

  // =========================================================================
  // Approval gate  (tested through getTaskDetail as a representative endpoint)
  // =========================================================================
  describe("approval gate (getApprovedNgoProfile)", () => {
    test("404 – NGO profile does not exist in database", async () => {
      ngoFindOneMock.mockResolvedValue(null);
      const res = mockRes();

      await getTaskDetail(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "NGO profile not found" })
      );
    });

    test("403 – approvalStatus is 'pending'", async () => {
      ngoFindOneMock.mockResolvedValue({ _id: NGO_PROFILE_ID, approvalStatus: "pending" });
      const res = mockRes();

      await getTaskDetail(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining("approved"),
        })
      );
    });

    test("403 – approvalStatus is 'rejected'", async () => {
      ngoFindOneMock.mockResolvedValue({ _id: NGO_PROFILE_ID, approvalStatus: "rejected" });
      const res = mockRes();

      await getTaskDetail(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(403);
    });

    test("403 – approvalStatus is 'suspended'", async () => {
      ngoFindOneMock.mockResolvedValue({ _id: NGO_PROFILE_ID, approvalStatus: "suspended" });
      const res = mockRes();

      await acceptTask(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(403);
    });

    test("approval gate is consulted with the calling user's _id", async () => {
      ngoFindOneMock.mockResolvedValue(null);
      const res = mockRes();
      const userId = "specific-user-xyz";

      await getTaskDetail(
        mockReq({ user: { _id: userId }, params: { requestId: REQUEST_ID } }),
        res
      );

      expect(ngoFindOneMock).toHaveBeenCalledWith({ userId });
    });
  });

  // =========================================================================
  // getMyTasks
  // =========================================================================
  describe("getMyTasks", () => {
    /** Default successful query setup using default pagination. */
    function setupSuccessfulList(docs = [helpRequest()], total = 1) {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpCountDocumentsMock.mockResolvedValue(total);
      helpFindMock.mockReturnValue(buildFindChain(docs));
    }

    test("200 – returns paginated results for approved NGO (no filter)", async () => {
      setupSuccessfulList([helpRequest(), helpRequest()], 2);
      const res = mockRes();

      await getMyTasks(mockReq({ query: {} }), res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          pagination: expect.objectContaining({
            total: 2,
            page: 1,
            limit: 10,
            totalPages: 1,
          }),
        })
      );
    });

    test("200 – pagination data reflects page and limit query params", async () => {
      setupSuccessfulList([], 0);
      const res = mockRes();

      await getMyTasks(mockReq({ query: { page: "3", limit: "5" } }), res);

      const call = res.json.mock.calls[0][0];
      expect(call.pagination.page).toBe(3);
      expect(call.pagination.limit).toBe(5);
    });

    test("200 – clamps limit at maximum value of 50", async () => {
      setupSuccessfulList([], 0);
      const res = mockRes();

      await getMyTasks(mockReq({ query: { limit: "200" } }), res);

      const call = res.json.mock.calls[0][0];
      expect(call.pagination.limit).toBe(50);
    });

    test("200 – clamps limit at minimum value of 1", async () => {
      setupSuccessfulList([], 0);
      const res = mockRes();

      await getMyTasks(mockReq({ query: { limit: "-5" } }), res);

      const call = res.json.mock.calls[0][0];
      expect(call.pagination.limit).toBe(1);
    });

    test("200 – defaults to page 1 when page query param is absent", async () => {
      setupSuccessfulList([], 0);
      const res = mockRes();

      await getMyTasks(mockReq({ query: {} }), res);

      expect(res.json.mock.calls[0][0].pagination.page).toBe(1);
    });

    test("200 – page is clamped to minimum value of 1 for non-positive input", async () => {
      setupSuccessfulList([], 0);
      const res = mockRes();

      await getMyTasks(mockReq({ query: { page: "0" } }), res);

      expect(res.json.mock.calls[0][0].pagination.page).toBe(1);
    });

    test("200 – correct totalPages calculation", async () => {
      setupSuccessfulList([], 23);
      const res = mockRes();

      await getMyTasks(mockReq({ query: { limit: "10" } }), res);

      expect(res.json.mock.calls[0][0].pagination.totalPages).toBe(3);
    });

    test("400 – rejects unknown status filter value", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      const res = mockRes();

      await getMyTasks(mockReq({ query: { status: "unknown_status" } }), res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    test.each(["assigned", "accepted", "declined", "in-progress", "completed"])(
      "200 – accepts valid status filter '%s' and queries with $elemMatch",
      async (status) => {
        setupSuccessfulList([], 0);
        const res = mockRes();

        await getMyTasks(mockReq({ query: { status } }), res);

        expect(helpFindMock).toHaveBeenCalledWith(
          expect.objectContaining({
            assignments: {
              $elemMatch: expect.objectContaining({ status }),
            },
          })
        );
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({ success: true })
        );
      }
    );

    test("200 – query without status filter does not include status in $elemMatch", async () => {
      setupSuccessfulList([], 0);
      const res = mockRes();

      await getMyTasks(mockReq({ query: {} }), res);

      const queryArg = helpFindMock.mock.calls[0][0];
      expect(queryArg.assignments.$elemMatch).not.toHaveProperty("status");
    });

    test("500 – server error is handled gracefully", async () => {
      ngoFindOneMock.mockRejectedValue(new Error("DB timeout"));
      const res = mockRes();

      await getMyTasks(mockReq({ query: {} }), res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Server error" })
      );
    });
  });

  // =========================================================================
  // getPerformance
  // =========================================================================
  describe("getPerformance", () => {
    test("200 – returns profile stats and mapped assignment counts", async () => {
      ngoFindOneMock.mockResolvedValue(
        approvedProfile({ completedTasks: 7, averageResponseTime: 45, rating: 4.2 })
      );
      helpAggregateMock.mockResolvedValue([
        { _id: "completed", count: 7 },
        { _id: "declined", count: 2 },
        { _id: "in-progress", count: 1 },
        { _id: "accepted", count: 3 },
        { _id: "assigned", count: 4 },
      ]);

      const res = mockRes();
      await getPerformance(mockReq(), res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          completedTasks: 7,
          averageResponseTime: 45,
          rating: 4.2,
          availabilityStatus: "AVAILABLE",
          assignmentCounts: {
            assigned: 4,
            accepted: 3,
            declined: 2,
            inProgress: 1,
            completed: 7,
          },
        }),
      });
    });

    test("200 – missing status keys default to 0", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile({ completedTasks: 0 }));
      helpAggregateMock.mockResolvedValue([]); // no assignments at all

      const res = mockRes();
      await getPerformance(mockReq(), res);

      const { assignmentCounts } = res.json.mock.calls[0][0].data;
      expect(assignmentCounts).toEqual({
        assigned: 0,
        accepted: 0,
        declined: 0,
        inProgress: 0,
        completed: 0,
      });
    });

    test("200 – averageResponseTime is null when not set on profile", async () => {
      ngoFindOneMock.mockResolvedValue(
        approvedProfile({ averageResponseTime: undefined })
      );
      helpAggregateMock.mockResolvedValue([]);

      const res = mockRes();
      await getPerformance(mockReq(), res);

      expect(res.json.mock.calls[0][0].data.averageResponseTime).toBeNull();
    });

    test("200 – aggregate pipeline targets the correct NGO profile ID", async () => {
      const profile = approvedProfile();
      ngoFindOneMock.mockResolvedValue(profile);
      helpAggregateMock.mockResolvedValue([]);

      const res = mockRes();
      await getPerformance(mockReq(), res);

      // The aggregate stages must include a $match on assignments.ngoId
      const pipelineArg = helpAggregateMock.mock.calls[0][0];
      const matchStage = pipelineArg.find((s) => s.$match !== undefined);
      expect(matchStage.$match["assignments.ngoId"]).toEqual(profile._id);
    });

    test("500 – server error is handled gracefully", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpAggregateMock.mockRejectedValue(new Error("Aggregation failed"));

      const res = mockRes();
      await getPerformance(mockReq(), res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Server error" })
      );
    });
  });

  // =========================================================================
  // getTaskDetail
  // =========================================================================
  describe("getTaskDetail", () => {
    test("400 – invalid ObjectId format", async () => {
      objectIdIsValidMock.mockReturnValue(false);
      const res = mockRes();

      await getTaskDetail(
        mockReq({ params: { requestId: "bad-id" } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Invalid help request ID" })
      );
    });

    test("400 – ObjectId validation is checked before DB query", async () => {
      objectIdIsValidMock.mockReturnValue(false);
      const res = mockRes();

      await getTaskDetail(
        mockReq({ params: { requestId: "bad-id" } }),
        res
      );

      expect(ngoFindOneMock).not.toHaveBeenCalled();
      expect(helpFindOneMock).not.toHaveBeenCalled();
    });

    test("404 – help request not found (findOne returns null)", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindOneMock.mockResolvedValue(null);
      const res = mockRes();

      await getTaskDetail(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining("not found"),
        })
      );
    });

    test("200 – returns help request details on success", async () => {
      const hr = helpRequest();
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindOneMock.mockResolvedValue(hr);
      const res = mockRes();

      await getTaskDetail(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(res.json).toHaveBeenCalledWith({ success: true, data: hr });
    });

    test("200 – findOne query scopes by both requestId and NGO profile _id", async () => {
      const profile = approvedProfile();
      ngoFindOneMock.mockResolvedValue(profile);
      helpFindOneMock.mockResolvedValue(helpRequest());
      const res = mockRes();

      await getTaskDetail(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(helpFindOneMock).toHaveBeenCalledWith({
        _id: REQUEST_ID,
        "assignments.ngoId": profile._id,
      });
    });

    test("500 – server error is handled gracefully", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindOneMock.mockRejectedValue(new Error("Network failure"));
      const res = mockRes();

      await getTaskDetail(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Server error" })
      );
    });
  });

  // =========================================================================
  // acceptTask
  // =========================================================================
  describe("acceptTask", () => {
    test("400 – invalid ObjectId", async () => {
      objectIdIsValidMock.mockReturnValue(false);
      const res = mockRes();

      await acceptTask(
        mockReq({ params: { requestId: "bad-id" } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Invalid help request ID" })
      );
    });

    test("404 – help request does not exist", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindByIdMock.mockResolvedValue(null);
      const res = mockRes();

      await acceptTask(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Help request not found" })
      );
    });

    test("404 – NGO is not listed in assignments", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      const hr = helpRequest({ ngoId: { toString: () => "different-ngo-id" } });
      helpFindByIdMock.mockResolvedValue(hr);
      const res = mockRes();

      await acceptTask(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    test("400 – assignment is already 'accepted' (not in 'assigned' state)", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindByIdMock.mockResolvedValue(helpRequest({ status: "accepted" }));
      const res = mockRes();

      await acceptTask(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    test("400 – assignment is 'in-progress' (not in 'assigned' state)", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindByIdMock.mockResolvedValue(helpRequest({ status: "in-progress" }));
      const res = mockRes();

      await acceptTask(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("200 – successfully accepts an assigned task", async () => {
      const profile = approvedProfile();
      ngoFindOneMock.mockResolvedValue(profile);
      const hr = helpRequest({ status: "assigned" });
      helpFindByIdMock.mockResolvedValue(hr);
      const res = mockRes();

      await acceptTask(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(hr.assignments[0].status).toBe("accepted");
      expect(profile.acceptedRequests).toContain(REQUEST_ID);
      expect(hr.save).toHaveBeenCalled();
      expect(ngoSaveMock).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            requestId: REQUEST_ID,
            assignmentStatus: "accepted",
          }),
        })
      );
    });

    test("200 – does not add duplicate entry to acceptedRequests", async () => {
      const profile = approvedProfile({
        acceptedRequests: [{ toString: () => REQUEST_ID }],
      });
      ngoFindOneMock.mockResolvedValue(profile);
      helpFindByIdMock.mockResolvedValue(helpRequest({ status: "assigned" }));
      const res = mockRes();

      await acceptTask(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      const count = profile.acceptedRequests
        .map((id) => id.toString())
        .filter((id) => id === REQUEST_ID).length;
      expect(count).toBe(1);
    });

    test("200 – both helpRequest and profile are persisted", async () => {
      const profile = approvedProfile();
      ngoFindOneMock.mockResolvedValue(profile);
      const hr = helpRequest({ status: "assigned" });
      helpFindByIdMock.mockResolvedValue(hr);
      const res = mockRes();

      await acceptTask(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(hr.save).toHaveBeenCalledTimes(1);
      expect(ngoSaveMock).toHaveBeenCalledTimes(1);
    });

    test("500 – server error is handled gracefully", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindByIdMock.mockRejectedValue(new Error("DB write failed"));
      const res = mockRes();

      await acceptTask(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Server error" })
      );
    });
  });

  // =========================================================================
  // declineTask
  // =========================================================================
  describe("declineTask", () => {
    test("400 – invalid ObjectId", async () => {
      objectIdIsValidMock.mockReturnValue(false);
      const res = mockRes();

      await declineTask(
        mockReq({ params: { requestId: "bad-id" }, body: {} }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("404 – help request does not exist", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindByIdMock.mockResolvedValue(null);
      const res = mockRes();

      await declineTask(
        mockReq({ params: { requestId: REQUEST_ID }, body: {} }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("404 – NGO is not in assignments list", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      const hr = helpRequest({ ngoId: { toString: () => "another-ngo" } });
      helpFindByIdMock.mockResolvedValue(hr);
      const res = mockRes();

      await declineTask(
        mockReq({ params: { requestId: REQUEST_ID }, body: {} }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("400 – assignment is already 'accepted' (cannot decline)", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindByIdMock.mockResolvedValue(helpRequest({ status: "accepted" }));
      const res = mockRes();

      await declineTask(
        mockReq({ params: { requestId: REQUEST_ID }, body: {} }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    test("400 – assignment is already 'in-progress' (cannot decline)", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindByIdMock.mockResolvedValue(helpRequest({ status: "in-progress" }));
      const res = mockRes();

      await declineTask(
        mockReq({ params: { requestId: REQUEST_ID }, body: {} }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("200 – successfully declines with a reason", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      const hr = helpRequest({ status: "assigned" });
      helpFindByIdMock.mockResolvedValue(hr);
      const res = mockRes();

      await declineTask(
        mockReq({ params: { requestId: REQUEST_ID }, body: { reason: "No capacity" } }),
        res
      );

      expect(hr.assignments[0].status).toBe("declined");
      expect(hr.assignments[0].declineReason).toBe("No capacity");
      expect(hr.save).toHaveBeenCalled();
      expect(ngoSaveMock).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            requestId: REQUEST_ID,
            assignmentStatus: "declined",
            declineReason: "No capacity",
          }),
        })
      );
    });

    test("200 – declines without a reason (declineReason is null in response)", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      const hr = helpRequest({ status: "assigned" });
      helpFindByIdMock.mockResolvedValue(hr);
      const res = mockRes();

      await declineTask(
        mockReq({ params: { requestId: REQUEST_ID }, body: {} }),
        res
      );

      expect(hr.assignments[0].status).toBe("declined");
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ declineReason: null }),
        })
      );
    });

    test("200 – removes requestId from acceptedRequests if present", async () => {
      const profile = approvedProfile({
        acceptedRequests: [
          { toString: () => REQUEST_ID },
          { toString: () => "other-request" },
        ],
      });
      ngoFindOneMock.mockResolvedValue(profile);
      helpFindByIdMock.mockResolvedValue(helpRequest({ status: "assigned" }));
      const res = mockRes();

      await declineTask(
        mockReq({ params: { requestId: REQUEST_ID }, body: {} }),
        res
      );

      const remaining = profile.acceptedRequests.map((id) => id.toString());
      expect(remaining).not.toContain(REQUEST_ID);
      expect(remaining).toContain("other-request");
    });

    test("500 – server error is handled gracefully", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindByIdMock.mockRejectedValue(new Error("Unexpected error"));
      const res = mockRes();

      await declineTask(
        mockReq({ params: { requestId: REQUEST_ID }, body: {} }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Server error" })
      );
    });
  });

  // =========================================================================
  // markInProgress
  // =========================================================================
  describe("markInProgress", () => {
    test("400 – invalid ObjectId", async () => {
      objectIdIsValidMock.mockReturnValue(false);
      const res = mockRes();

      await markInProgress(
        mockReq({ params: { requestId: "bad-id" } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("404 – help request does not exist", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindByIdMock.mockResolvedValue(null);
      const res = mockRes();

      await markInProgress(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("404 – NGO is not in assignments", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      const hr = helpRequest({ ngoId: { toString: () => "other-ngo" } });
      helpFindByIdMock.mockResolvedValue(hr);
      const res = mockRes();

      await markInProgress(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("400 – assignment is 'assigned' (must be 'accepted' first)", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindByIdMock.mockResolvedValue(helpRequest({ status: "assigned" }));
      const res = mockRes();

      await markInProgress(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    test("400 – assignment is already 'in-progress'", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindByIdMock.mockResolvedValue(helpRequest({ status: "in-progress" }));
      const res = mockRes();

      await markInProgress(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("200 – transitions assignment to in-progress and promotes help request status", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      const hr = helpRequest({ status: "accepted" }, { status: "assigned" });
      helpFindByIdMock.mockResolvedValue(hr);
      const res = mockRes();

      await markInProgress(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(hr.assignments[0].status).toBe("in-progress");
      expect(hr.status).toBe("in-progress");
      expect(hr.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            requestId: REQUEST_ID,
            assignmentStatus: "in-progress",
            helpRequestStatus: "in-progress",
          }),
        })
      );
    });

    test("200 – help request already 'in-progress': status unchanged", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      const hr = helpRequest({ status: "accepted" }, { status: "in-progress" });
      helpFindByIdMock.mockResolvedValue(hr);
      const res = mockRes();

      await markInProgress(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(hr.status).toBe("in-progress"); // not downgraded or changed
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test("200 – does NOT downgrade a 'resolved' help request", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      const hr = helpRequest({ status: "accepted" }, { status: "resolved" });
      helpFindByIdMock.mockResolvedValue(hr);
      const res = mockRes();

      await markInProgress(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(hr.status).toBe("resolved");
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test("200 – NGO profile is NOT saved (markInProgress only saves helpRequest)", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      const hr = helpRequest({ status: "accepted" }, { status: "assigned" });
      helpFindByIdMock.mockResolvedValue(hr);
      const res = mockRes();

      await markInProgress(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(ngoSaveMock).not.toHaveBeenCalled();
    });

    test("500 – server error is handled gracefully", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindByIdMock.mockRejectedValue(new Error("Write conflict"));
      const res = mockRes();

      await markInProgress(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Server error" })
      );
    });
  });

  // =========================================================================
  // markCompleted
  // =========================================================================
  describe("markCompleted", () => {
    test("400 – invalid ObjectId", async () => {
      objectIdIsValidMock.mockReturnValue(false);
      const res = mockRes();

      await markCompleted(
        mockReq({ params: { requestId: "bad-id" } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("404 – help request does not exist", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindByIdMock.mockResolvedValue(null);
      const res = mockRes();

      await markCompleted(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("404 – NGO is not in assignments", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      const hr = helpRequest({ ngoId: { toString: () => "stranger-ngo" } });
      helpFindByIdMock.mockResolvedValue(hr);
      const res = mockRes();

      await markCompleted(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("400 – assignment is 'accepted' (not in-progress)", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindByIdMock.mockResolvedValue(helpRequest({ status: "accepted" }));
      const res = mockRes();

      await markCompleted(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    test("200 – marks assignment completed, sets completedAt, increments completedTasks", async () => {
      const profile = approvedProfile({ completedTasks: 3 });
      ngoFindOneMock.mockResolvedValue(profile);
      const hr = helpRequest({ status: "in-progress" }, { status: "in-progress" });
      helpFindByIdMock.mockResolvedValue(hr);
      const res = mockRes();

      await markCompleted(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(hr.assignments[0].status).toBe("completed");
      expect(hr.assignments[0].completedAt).toBeInstanceOf(Date);
      expect(profile.completedTasks).toBe(4);
      expect(hr.save).toHaveBeenCalled();
      expect(ngoSaveMock).toHaveBeenCalled();
    });

    test("200 – completedTasks increments from 0 when previously unset/falsy", async () => {
      const profile = approvedProfile({ completedTasks: undefined });
      ngoFindOneMock.mockResolvedValue(profile);
      helpFindByIdMock.mockResolvedValue(helpRequest({ status: "in-progress" }));
      const res = mockRes();

      await markCompleted(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(profile.completedTasks).toBe(1);
    });

    test("200 – resolves help request when ALL assignments are done (completed or declined)", async () => {
      const profile = approvedProfile({ completedTasks: 0 });
      ngoFindOneMock.mockResolvedValue(profile);
      const hrSaveMock = jest.fn().mockResolvedValue(true);
      const hr = {
        _id: REQUEST_ID,
        status: "in-progress",
        resolvedAt: undefined,
        save: hrSaveMock,
        assignments: [
          { ngoId: { toString: () => NGO_PROFILE_ID }, status: "in-progress" },
          { ngoId: { toString: () => "ngo-2" }, status: "completed" },
          { ngoId: { toString: () => "ngo-3" }, status: "declined" },
        ],
      };
      helpFindByIdMock.mockResolvedValue(hr);
      const res = mockRes();

      await markCompleted(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(hr.status).toBe("resolved");
      expect(hr.resolvedAt).toBeInstanceOf(Date);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            helpRequestStatus: "resolved",
            helpRequestResolved: true,
          }),
        })
      );
    });

    test("200 – does NOT resolve when at least one assignment is still active", async () => {
      const profile = approvedProfile({ completedTasks: 0 });
      ngoFindOneMock.mockResolvedValue(profile);
      const hrSaveMock = jest.fn().mockResolvedValue(true);
      const hr = {
        _id: REQUEST_ID,
        status: "in-progress",
        resolvedAt: undefined,
        save: hrSaveMock,
        assignments: [
          { ngoId: { toString: () => NGO_PROFILE_ID }, status: "in-progress" },
          { ngoId: { toString: () => "ngo-2" }, status: "accepted" }, // still pending
        ],
      };
      helpFindByIdMock.mockResolvedValue(hr);
      const res = mockRes();

      await markCompleted(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(hr.status).toBe("in-progress"); // no change
      expect(hr.resolvedAt).toBeUndefined();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ helpRequestResolved: false }),
        })
      );
    });

    test("200 – sole assignment: resolves help request immediately", async () => {
      const profile = approvedProfile({ completedTasks: 1 });
      ngoFindOneMock.mockResolvedValue(profile);
      const hr = helpRequest({ status: "in-progress" }, { status: "in-progress" });
      helpFindByIdMock.mockResolvedValue(hr);
      const res = mockRes();

      await markCompleted(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(hr.status).toBe("resolved");
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ helpRequestResolved: true }),
        })
      );
    });

    test("200 – response includes all expected fields", async () => {
      const profile = approvedProfile({ completedTasks: 0 });
      ngoFindOneMock.mockResolvedValue(profile);
      const hr = helpRequest({ status: "in-progress" }, { status: "in-progress" });
      helpFindByIdMock.mockResolvedValue(hr);
      const res = mockRes();

      await markCompleted(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      const responseData = res.json.mock.calls[0][0].data;
      expect(responseData).toHaveProperty("requestId", REQUEST_ID);
      expect(responseData).toHaveProperty("assignmentStatus", "completed");
      expect(responseData).toHaveProperty("completedAt");
      expect(responseData).toHaveProperty("helpRequestStatus");
      expect(responseData).toHaveProperty("helpRequestResolved");
    });

    test("500 – server error is handled gracefully", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindByIdMock.mockRejectedValue(new Error("Unexpected DB error"));
      const res = mockRes();

      await markCompleted(
        mockReq({ params: { requestId: REQUEST_ID } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Server error" })
      );
    });
  });
});
