import { jest } from "@jest/globals";

// ── helpers ──
function makeRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

// ── model mocks ──
const createMock = jest.fn();
const findByIdMock = jest.fn();
const findMock = jest.fn();

await jest.unstable_mockModule("../../../models/Campaign.js", () => ({
  default: {
    create: createMock,
    findById: findByIdMock,
    find: findMock,
  },
}));

const {
  createCampaign,
  updateCampaign,
  getAllActiveCampaigns,
  getCampaignById,
} = await import("../../../controllers/campaignController.js");

// ── test data ──
const ngoUserId = "ngo123";
const otherUserId = "other456";

const validBody = {
  title: "Flood Relief 2026",
  description: "Helping flood victims in the southern province",
  targetAmount: 500000,
  bankDetails: {
    accountName: "RescueNet NGO",
    accountNumber: "1234567890",
    bankName: "Bank of Ceylon",
    branchName: "Colombo",
  },
  acceptedItems: ["Clothes", "Dry Rations"],
};

const mockCampaign = {
  _id: "camp1",
  ngoId: {
    equals: (id) => id === ngoUserId,
    toString: () => ngoUserId,
  },
  ...validBody,
  raisedAmount: 0,
  status: "Active",
  save: jest.fn(),
};

// ──────────────────────────────────────────────
describe("Campaign Controller - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCampaign.save.mockResolvedValue(mockCampaign);
  });

  // ═══════════════════════════════════════════
  // createCampaign
  // ═══════════════════════════════════════════
  describe("createCampaign", () => {
    test("should create a campaign and return 201", async () => {
      createMock.mockResolvedValue(mockCampaign);

      const req = { user: { _id: ngoUserId }, body: validBody };
      const res = makeRes();

      await createCampaign(req, res);

      expect(createMock).toHaveBeenCalledWith({
        ...validBody,
        ngoId: ngoUserId,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Campaign created successfully",
          campaign: mockCampaign,
        })
      );
    });

    test("should attach ngoId from req.user._id", async () => {
      createMock.mockResolvedValue(mockCampaign);

      const req = { user: { _id: "custom-ngo-id" }, body: { title: "T" } };
      const res = makeRes();

      await createCampaign(req, res);

      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({ ngoId: "custom-ngo-id" })
      );
    });

    test("should return 500 when Campaign.create throws", async () => {
      createMock.mockRejectedValue(new Error("DB write failed"));

      const req = { user: { _id: ngoUserId }, body: validBody };
      const res = makeRes();

      await createCampaign(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Failed to create campaign",
          error: "DB write failed",
        })
      );
    });
  });

  // ═══════════════════════════════════════════
  // updateCampaign
  // ═══════════════════════════════════════════
  describe("updateCampaign", () => {
    test("should return 404 when campaign does not exist", async () => {
      findByIdMock.mockResolvedValue(null);

      const req = {
        user: { _id: ngoUserId },
        params: { id: "nonexistent" },
        body: { title: "New Title" },
      };
      const res = makeRes();

      await updateCampaign(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Campaign not found",
        })
      );
    });

    test("should return 403 when user is not the campaign owner", async () => {
      findByIdMock.mockResolvedValue(mockCampaign);

      const req = {
        user: { _id: otherUserId },
        params: { id: "camp1" },
        body: { title: "Hijack" },
      };
      const res = makeRes();

      await updateCampaign(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "You can only update your own campaigns",
        })
      );
    });

    test("should update campaign and return 200 for the owner", async () => {
      const saveable = { ...mockCampaign, save: jest.fn() };
      saveable.save.mockResolvedValue(saveable);
      findByIdMock.mockResolvedValue(saveable);

      const req = {
        user: { _id: ngoUserId },
        params: { id: "camp1" },
        body: { title: "Updated Title" },
      };
      const res = makeRes();

      await updateCampaign(req, res);

      expect(saveable.title).toBe("Updated Title");
      expect(saveable.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Campaign updated successfully",
        })
      );
    });

    test("should update status field when provided", async () => {
      const saveable = { ...mockCampaign, save: jest.fn() };
      saveable.save.mockResolvedValue(saveable);
      findByIdMock.mockResolvedValue(saveable);

      const req = {
        user: { _id: ngoUserId },
        params: { id: "camp1" },
        body: { status: "Completed" },
      };
      const res = makeRes();

      await updateCampaign(req, res);

      expect(saveable.status).toBe("Completed");
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("should return 500 when save throws", async () => {
      const saveable = { ...mockCampaign, save: jest.fn() };
      saveable.save.mockRejectedValue(new Error("Save failed"));
      findByIdMock.mockResolvedValue(saveable);

      const req = {
        user: { _id: ngoUserId },
        params: { id: "camp1" },
        body: { title: "X" },
      };
      const res = makeRes();

      await updateCampaign(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Failed to update campaign",
        })
      );
    });
  });

  // ═══════════════════════════════════════════
  // getAllActiveCampaigns
  // ═══════════════════════════════════════════
  describe("getAllActiveCampaigns", () => {
    test("should return all active campaigns with 200", async () => {
      const activeCampaigns = [mockCampaign, { ...mockCampaign, _id: "camp2" }];
      findMock.mockReturnValue({
        populate: jest.fn().mockResolvedValue(activeCampaigns),
      });

      const req = {};
      const res = makeRes();

      await getAllActiveCampaigns(req, res);

      expect(findMock).toHaveBeenCalledWith({ status: "Active" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          campaigns: activeCampaigns,
        })
      );
    });

    test("should return empty array when no active campaigns exist", async () => {
      findMock.mockReturnValue({
        populate: jest.fn().mockResolvedValue([]),
      });

      const req = {};
      const res = makeRes();

      await getAllActiveCampaigns(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          campaigns: [],
        })
      );
    });

    test("should populate ngoId with name and email", async () => {
      const populateMock = jest.fn().mockResolvedValue([]);
      findMock.mockReturnValue({ populate: populateMock });

      const req = {};
      const res = makeRes();

      await getAllActiveCampaigns(req, res);

      expect(populateMock).toHaveBeenCalledWith("ngoId", "name email");
    });

    test("should return 500 on database error", async () => {
      findMock.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("DB error")),
      });

      const req = {};
      const res = makeRes();

      await getAllActiveCampaigns(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Failed to fetch campaigns",
        })
      );
    });
  });

  // ═══════════════════════════════════════════
  // getCampaignById
  // ═══════════════════════════════════════════
  describe("getCampaignById", () => {
    test("should return 200 with campaign when found", async () => {
      findByIdMock.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCampaign),
      });

      const req = { params: { id: "camp1" } };
      const res = makeRes();

      await getCampaignById(req, res);

      expect(findByIdMock).toHaveBeenCalledWith("camp1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          campaign: mockCampaign,
        })
      );
    });

    test("should return 404 when campaign not found", async () => {
      findByIdMock.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      const req = { params: { id: "nonexistent" } };
      const res = makeRes();

      await getCampaignById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Campaign not found",
        })
      );
    });

    test("should populate ngoId with name and email", async () => {
      const populateMock = jest.fn().mockResolvedValue(mockCampaign);
      findByIdMock.mockReturnValue({ populate: populateMock });

      const req = { params: { id: "camp1" } };
      const res = makeRes();

      await getCampaignById(req, res);

      expect(populateMock).toHaveBeenCalledWith("ngoId", "name email");
    });

    test("should return 500 on database error", async () => {
      findByIdMock.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("Find failed")),
      });

      const req = { params: { id: "camp1" } };
      const res = makeRes();

      await getCampaignById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Failed to fetch campaign",
        })
      );
    });
  });
});
