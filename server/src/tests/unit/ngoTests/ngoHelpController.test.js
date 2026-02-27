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

// NgoProfile mock methods
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

// HelpRequest mock methods
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

// ---- Import controller AFTER mocks ----
const {
  getMyTasks,
  getPerformance,
  getTaskDetail,
  acceptTask,
  declineTask,
  markInProgress,
  markCompleted,
} = await import("../../../controllers/ngoHelpController.js");

// ---- Helpers ----
function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

const NGO_USER_ID = "user001";
const NGO_PROFILE_ID = "ngoProfile001";
const REQUEST_ID = "helpReq001";

/** Returns a mock NgoProfile that passes the approval gate */
function approvedProfile(overrides = {}) {
  return {
    _id: NGO_PROFILE_ID,
    userId: NGO_USER_ID,
    approvalStatus: "approved",
    completedTasks: 0,
    acceptedRequests: [],
    save: ngoSaveMock,
    ...overrides,
  };
}

/** Returns a minimal mock HelpRequest with one assignment for this NGO */
function helpRequest(assignmentOverrides = {}, requestOverrides = {}) {
  const hrSaveMock = jest.fn().mockResolvedValue(true);
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
    save: hrSaveMock,
    ...requestOverrides,
  };
}

// ---- Test suites ----

describe("ngoHelpController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    objectIdIsValidMock.mockReturnValue(true);
    ngoSaveMock.mockResolvedValue(true);
  });

  // -------------------------------------------------------------------------
  // Approval guard (shared by all functions; tested via getTaskDetail)
  // -------------------------------------------------------------------------
  describe("approval gate", () => {
    test("returns 404 when NGO profile does not exist", async () => {
      ngoFindOneMock.mockResolvedValue(null);

      const res = mockRes();
      await getTaskDetail(
        { params: { requestId: REQUEST_ID }, user: { _id: NGO_USER_ID } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "NGO profile not found" })
      );
    });

    test("returns 403 when approvalStatus is pending", async () => {
      ngoFindOneMock.mockResolvedValue({
        _id: NGO_PROFILE_ID,
        approvalStatus: "pending",
      });

      const res = mockRes();
      await getTaskDetail(
        { params: { requestId: REQUEST_ID }, user: { _id: NGO_USER_ID } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    test("returns 403 when approvalStatus is suspended", async () => {
      ngoFindOneMock.mockResolvedValue({
        _id: NGO_PROFILE_ID,
        approvalStatus: "suspended",
      });

      const res = mockRes();
      await acceptTask(
        { params: { requestId: REQUEST_ID }, user: { _id: NGO_USER_ID } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  // -------------------------------------------------------------------------
  // getMyTasks
  // -------------------------------------------------------------------------
  describe("getMyTasks", () => {
    test("returns paginated list for approved NGO", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpCountDocumentsMock.mockResolvedValue(2);
      const sortMock = jest.fn();
      const skipMock = jest.fn();
      const limitMock = jest.fn();
      const selectMock = jest.fn().mockResolvedValue([helpRequest(), helpRequest()]);
      limitMock.mockReturnValue({ select: selectMock });
      skipMock.mockReturnValue({ limit: limitMock });
      sortMock.mockReturnValue({ skip: skipMock });
      helpFindMock.mockReturnValue({ sort: sortMock });

      const res = mockRes();
      await getMyTasks(
        { query: { page: "1", limit: "10" }, user: { _id: NGO_USER_ID } },
        res
      );

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          pagination: expect.objectContaining({ total: 2, page: 1, limit: 10 }),
        })
      );
    });

    test("returns 400 for invalid status filter", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());

      const res = mockRes();
      await getMyTasks(
        { query: { status: "invalid_status" }, user: { _id: NGO_USER_ID } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    test("passes status filter to query when valid", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpCountDocumentsMock.mockResolvedValue(0);
      const selectMock = jest.fn().mockResolvedValue([]);
      const limitMock = jest.fn().mockReturnValue({ select: selectMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });
      helpFindMock.mockReturnValue({ sort: sortMock });

      const res = mockRes();
      await getMyTasks(
        { query: { status: "accepted" }, user: { _id: NGO_USER_ID } },
        res
      );

      expect(helpFindMock).toHaveBeenCalledWith(
        expect.objectContaining({
          assignments: { $elemMatch: expect.objectContaining({ status: "accepted" }) },
        })
      );
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  // -------------------------------------------------------------------------
  // getPerformance
  // -------------------------------------------------------------------------
  describe("getPerformance", () => {
    test("returns profile stats and aggregated assignment counts", async () => {
      ngoFindOneMock.mockResolvedValue(
        approvedProfile({ completedTasks: 5, rating: 4, averageResponseTime: 30 })
      );
      helpAggregateMock.mockResolvedValue([
        { _id: "completed", count: 5 },
        { _id: "declined", count: 1 },
        { _id: "in-progress", count: 2 },
      ]);

      const res = mockRes();
      await getPerformance({ user: { _id: NGO_USER_ID } }, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          completedTasks: 5,
          rating: 4,
          assignmentCounts: expect.objectContaining({
            completed: 5,
            declined: 1,
            inProgress: 2,
            assigned: 0,
            accepted: 0,
          }),
        }),
      });
    });
  });

  // -------------------------------------------------------------------------
  // getTaskDetail
  // -------------------------------------------------------------------------
  describe("getTaskDetail", () => {
    test("returns 400 for invalid ObjectId", async () => {
      objectIdIsValidMock.mockReturnValue(false);

      const res = mockRes();
      await getTaskDetail(
        { params: { requestId: "bad-id" }, user: { _id: NGO_USER_ID } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("returns 404 when help request not found or NGO not in assignments", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindOneMock.mockResolvedValue(null);

      const res = mockRes();
      await getTaskDetail(
        { params: { requestId: REQUEST_ID }, user: { _id: NGO_USER_ID } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("returns help request on success", async () => {
      const hr = helpRequest();
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindOneMock.mockResolvedValue(hr);

      const res = mockRes();
      await getTaskDetail(
        { params: { requestId: REQUEST_ID }, user: { _id: NGO_USER_ID } },
        res
      );

      expect(res.json).toHaveBeenCalledWith({ success: true, data: hr });
    });
  });

  // -------------------------------------------------------------------------
  // acceptTask
  // -------------------------------------------------------------------------
  describe("acceptTask", () => {
    test("returns 404 when help request not found", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindByIdMock.mockResolvedValue(null);

      const res = mockRes();
      await acceptTask(
        { params: { requestId: REQUEST_ID }, user: { _id: NGO_USER_ID } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("returns 404 when NGO is not in assignments", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      const hr = helpRequest();
      hr.assignments[0].ngoId = { toString: () => "someOtherNgoId" };
      helpFindByIdMock.mockResolvedValue(hr);

      const res = mockRes();
      await acceptTask(
        { params: { requestId: REQUEST_ID }, user: { _id: NGO_USER_ID } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("returns 400 when assignment is not in assigned state", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindByIdMock.mockResolvedValue(helpRequest({ status: "accepted" }));

      const res = mockRes();
      await acceptTask(
        { params: { requestId: REQUEST_ID }, user: { _id: NGO_USER_ID } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    test("accepts task and adds to acceptedRequests", async () => {
      const profile = approvedProfile();
      ngoFindOneMock.mockResolvedValue(profile);
      const hr = helpRequest({ status: "assigned" });
      helpFindByIdMock.mockResolvedValue(hr);

      const res = mockRes();
      await acceptTask(
        { params: { requestId: REQUEST_ID }, user: { _id: NGO_USER_ID } },
        res
      );

      expect(hr.assignments[0].status).toBe("accepted");
      expect(profile.acceptedRequests).toContain(REQUEST_ID);
      expect(hr.save).toHaveBeenCalled();
      expect(ngoSaveMock).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    test("does not duplicate requestId in acceptedRequests", async () => {
      const profile = approvedProfile({
        acceptedRequests: [{ toString: () => REQUEST_ID }],
      });
      ngoFindOneMock.mockResolvedValue(profile);
      helpFindByIdMock.mockResolvedValue(helpRequest({ status: "assigned" }));

      const res = mockRes();
      await acceptTask(
        { params: { requestId: REQUEST_ID }, user: { _id: NGO_USER_ID } },
        res
      );

      // The profile already has the ID in some form; push should not add another
      const stringIds = profile.acceptedRequests.map((id) => id.toString());
      expect(stringIds.filter((id) => id === REQUEST_ID).length).toBe(1);
    });
  });

  // -------------------------------------------------------------------------
  // declineTask
  // -------------------------------------------------------------------------
  describe("declineTask", () => {
    test("returns 400 when assignment is not in assigned state", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindByIdMock.mockResolvedValue(helpRequest({ status: "accepted" }));

      const res = mockRes();
      await declineTask(
        { params: { requestId: REQUEST_ID }, body: {}, user: { _id: NGO_USER_ID } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("sets assignment status to declined and stores reason", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      const hr = helpRequest({ status: "assigned" });
      helpFindByIdMock.mockResolvedValue(hr);

      const res = mockRes();
      await declineTask(
        {
          params: { requestId: REQUEST_ID },
          body: { reason: "Capacity full" },
          user: { _id: NGO_USER_ID },
        },
        res
      );

      expect(hr.assignments[0].status).toBe("declined");
      expect(hr.assignments[0].declineReason).toBe("Capacity full");
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    test("works without a reason provided", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      const hr = helpRequest({ status: "assigned" });
      helpFindByIdMock.mockResolvedValue(hr);

      const res = mockRes();
      await declineTask(
        { params: { requestId: REQUEST_ID }, body: {}, user: { _id: NGO_USER_ID } },
        res
      );

      expect(hr.assignments[0].status).toBe("declined");
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  // -------------------------------------------------------------------------
  // markInProgress
  // -------------------------------------------------------------------------
  describe("markInProgress", () => {
    test("returns 400 when assignment is not accepted", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindByIdMock.mockResolvedValue(helpRequest({ status: "assigned" }));

      const res = mockRes();
      await markInProgress(
        { params: { requestId: REQUEST_ID }, user: { _id: NGO_USER_ID } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("sets assignment to in-progress and promotes help request status", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      const hr = helpRequest({ status: "accepted" }, { status: "assigned" });
      helpFindByIdMock.mockResolvedValue(hr);

      const res = mockRes();
      await markInProgress(
        { params: { requestId: REQUEST_ID }, user: { _id: NGO_USER_ID } },
        res
      );

      expect(hr.assignments[0].status).toBe("in-progress");
      expect(hr.status).toBe("in-progress");
      expect(hr.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test("does not downgrade a resolved help request status", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      const hr = helpRequest({ status: "accepted" }, { status: "resolved" });
      helpFindByIdMock.mockResolvedValue(hr);

      const res = mockRes();
      await markInProgress(
        { params: { requestId: REQUEST_ID }, user: { _id: NGO_USER_ID } },
        res
      );

      expect(hr.status).toBe("resolved"); // must not be downgraded
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  // -------------------------------------------------------------------------
  // markCompleted
  // -------------------------------------------------------------------------
  describe("markCompleted", () => {
    test("returns 400 when assignment is not in-progress", async () => {
      ngoFindOneMock.mockResolvedValue(approvedProfile());
      helpFindByIdMock.mockResolvedValue(helpRequest({ status: "accepted" }));

      const res = mockRes();
      await markCompleted(
        { params: { requestId: REQUEST_ID }, user: { _id: NGO_USER_ID } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("marks assignment completed and increments completedTasks", async () => {
      const profile = approvedProfile({ completedTasks: 3 });
      ngoFindOneMock.mockResolvedValue(profile);
      const hr = helpRequest({ status: "in-progress" }, { status: "in-progress" });
      helpFindByIdMock.mockResolvedValue(hr);

      const res = mockRes();
      await markCompleted(
        { params: { requestId: REQUEST_ID }, user: { _id: NGO_USER_ID } },
        res
      );

      expect(hr.assignments[0].status).toBe("completed");
      expect(hr.assignments[0].completedAt).toBeDefined();
      expect(profile.completedTasks).toBe(4);
      expect(ngoSaveMock).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test("resolves help request when all assignments are done", async () => {
      const profile = approvedProfile({ completedTasks: 0 });
      ngoFindOneMock.mockResolvedValue(profile);

      // Two assignments: one already completed, one in-progress (ours)
      const hrSaveMock = jest.fn().mockResolvedValue(true);
      const hr = {
        _id: REQUEST_ID,
        status: "in-progress",
        save: hrSaveMock,
        assignments: [
          {
            ngoId: { toString: () => NGO_PROFILE_ID },
            status: "in-progress",
          },
          {
            ngoId: { toString: () => "otherNgo" },
            status: "completed",
          },
        ],
        resolvedAt: undefined,
      };
      helpFindByIdMock.mockResolvedValue(hr);

      const res = mockRes();
      await markCompleted(
        { params: { requestId: REQUEST_ID }, user: { _id: NGO_USER_ID } },
        res
      );

      expect(hr.status).toBe("resolved");
      expect(hr.resolvedAt).toBeDefined();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ helpRequestResolved: true }),
        })
      );
    });

    test("does NOT resolve help request when other assignments are still pending", async () => {
      const profile = approvedProfile({ completedTasks: 0 });
      ngoFindOneMock.mockResolvedValue(profile);

      const hrSaveMock = jest.fn().mockResolvedValue(true);
      const hr = {
        _id: REQUEST_ID,
        status: "in-progress",
        save: hrSaveMock,
        assignments: [
          {
            ngoId: { toString: () => NGO_PROFILE_ID },
            status: "in-progress",
          },
          {
            ngoId: { toString: () => "otherNgo" },
            status: "accepted", // still in progress by other NGO
          },
        ],
      };
      helpFindByIdMock.mockResolvedValue(hr);

      const res = mockRes();
      await markCompleted(
        { params: { requestId: REQUEST_ID }, user: { _id: NGO_USER_ID } },
        res
      );

      expect(hr.status).toBe("in-progress"); // unchanged
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ helpRequestResolved: false }),
        })
      );
    });
  });
});
