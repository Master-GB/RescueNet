import { jest } from "@jest/globals";

// ── helpers ──
function makeRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

// ── model mocks ──
const donationCreateMock = jest.fn();
const donationFindByIdMock = jest.fn();
const donationFindMock = jest.fn();

const campaignFindByIdMock = jest.fn();
const campaignFindByIdAndUpdateMock = jest.fn();

await jest.unstable_mockModule("../../../models/Donation.js", () => ({
  default: {
    create: donationCreateMock,
    findById: donationFindByIdMock,
    find: donationFindMock,
  },
}));

await jest.unstable_mockModule("../../../models/Campaign.js", () => ({
  default: {
    findById: campaignFindByIdMock,
    findByIdAndUpdate: campaignFindByIdAndUpdateMock,
  },
}));

const { submitDonation, getCampaignDonations, verifyDonation } = await import(
  "../../../controllers/donationController.js"
);

// ── shared data ──
const ngoUserId = "ngo123";
const donorUserId = "donor456";
const otherUserId = "other789";
const campaignId = "camp1";
const donationId = "don1";

const activeCampaign = {
  _id: campaignId,
  ngoId: { equals: (id) => id === ngoUserId, toString: () => ngoUserId },
  status: "Active",
  raisedAmount: 0,
};

const completedCampaign = {
  _id: campaignId,
  ngoId: { equals: (id) => id === ngoUserId },
  status: "Completed",
};

const pendingDonation = {
  _id: donationId,
  campaignId,
  donorId: donorUserId,
  donationType: "Money",
  declaredAmount: 1000,
  proofImageUrl: "https://res.cloudinary.com/demo/image/upload/proof.jpg",
  status: "Pending",
  save: jest.fn(),
};

// ──────────────────────────────────────────────
describe("Donation Controller - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pendingDonation.status = "Pending";
    pendingDonation.save.mockResolvedValue(pendingDonation);
  });

  // ═══════════════════════════════════════════
  // submitDonation
  // ═══════════════════════════════════════════
  describe("submitDonation", () => {
    test("should return 400 when no proof image is uploaded", async () => {
      const req = {
        user: { _id: donorUserId },
        body: { campaignId, donationType: "Money", declaredAmount: 500 },
        file: undefined,
      };
      const res = makeRes();

      await submitDonation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Proof image is required",
        })
      );
      expect(donationCreateMock).not.toHaveBeenCalled();
    });

    test("should return 404 when campaign does not exist", async () => {
      campaignFindByIdMock.mockResolvedValue(null);

      const req = {
        user: { _id: donorUserId },
        body: { campaignId: "nonexistent", donationType: "Money" },
        file: { path: "https://cloudinary.com/proof.jpg" },
      };
      const res = makeRes();

      await submitDonation(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Campaign not found",
        })
      );
    });

    test("should return 400 when campaign is not active", async () => {
      campaignFindByIdMock.mockResolvedValue(completedCampaign);

      const req = {
        user: { _id: donorUserId },
        body: { campaignId, donationType: "Money" },
        file: { path: "https://cloudinary.com/proof.jpg" },
      };
      const res = makeRes();

      await submitDonation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Cannot donate to a campaign that is not active",
        })
      );
    });

    test("should create donation and return 201 on success", async () => {
      campaignFindByIdMock.mockResolvedValue(activeCampaign);
      const createdDonation = { ...pendingDonation };
      donationCreateMock.mockResolvedValue(createdDonation);

      const req = {
        user: { _id: donorUserId },
        body: {
          campaignId,
          donationType: "Money",
          declaredAmount: 1000,
          donorMessage: "Stay strong!",
        },
        file: { path: "https://cloudinary.com/proof.jpg" },
      };
      const res = makeRes();

      await submitDonation(req, res);

      expect(donationCreateMock).toHaveBeenCalledWith({
        campaignId,
        donorId: donorUserId,
        donationType: "Money",
        declaredAmount: 1000,
        donorMessage: "Stay strong!",
        proofImageUrl: "https://cloudinary.com/proof.jpg",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining("Donation submitted successfully"),
          donation: createdDonation,
        })
      );
    });

    test("should default declaredAmount to 0 when not provided", async () => {
      campaignFindByIdMock.mockResolvedValue(activeCampaign);
      donationCreateMock.mockResolvedValue(pendingDonation);

      const req = {
        user: { _id: donorUserId },
        body: { campaignId, donationType: "Supplies" },
        file: { path: "https://cloudinary.com/proof.jpg" },
      };
      const res = makeRes();

      await submitDonation(req, res);

      expect(donationCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({ declaredAmount: 0 })
      );
    });

    test("should default donorMessage to empty string when not provided", async () => {
      campaignFindByIdMock.mockResolvedValue(activeCampaign);
      donationCreateMock.mockResolvedValue(pendingDonation);

      const req = {
        user: { _id: donorUserId },
        body: { campaignId, donationType: "Money", declaredAmount: 100 },
        file: { path: "https://cloudinary.com/proof.jpg" },
      };
      const res = makeRes();

      await submitDonation(req, res);

      expect(donationCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({ donorMessage: "" })
      );
    });

    test("should use req.file.path as proofImageUrl", async () => {
      campaignFindByIdMock.mockResolvedValue(activeCampaign);
      donationCreateMock.mockResolvedValue(pendingDonation);

      const cloudUrl =
        "https://res.cloudinary.com/demo/image/upload/v1234/rescuenet_donations/abc.jpg";
      const req = {
        user: { _id: donorUserId },
        body: { campaignId, donationType: "Money" },
        file: { path: cloudUrl },
      };
      const res = makeRes();

      await submitDonation(req, res);

      expect(donationCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({ proofImageUrl: cloudUrl })
      );
    });

    test("should return 500 when Donation.create throws", async () => {
      campaignFindByIdMock.mockResolvedValue(activeCampaign);
      donationCreateMock.mockRejectedValue(new Error("DB write failed"));

      const req = {
        user: { _id: donorUserId },
        body: { campaignId, donationType: "Money" },
        file: { path: "https://cloudinary.com/proof.jpg" },
      };
      const res = makeRes();

      await submitDonation(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Failed to submit donation",
        })
      );
    });
  });

  // ═══════════════════════════════════════════
  // getCampaignDonations
  // ═══════════════════════════════════════════
  describe("getCampaignDonations", () => {
    test("should return 404 when campaign does not exist", async () => {
      campaignFindByIdMock.mockResolvedValue(null);

      const req = {
        user: { _id: ngoUserId },
        params: { campaignId: "nonexistent" },
      };
      const res = makeRes();

      await getCampaignDonations(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Campaign not found" })
      );
    });

    test("should return 403 when NGO does not own the campaign", async () => {
      campaignFindByIdMock.mockResolvedValue(activeCampaign);

      const req = {
        user: { _id: otherUserId },
        params: { campaignId },
      };
      const res = makeRes();

      await getCampaignDonations(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "You can only view donations for your own campaigns",
        })
      );
    });

    test("should return 200 with donations for owner NGO", async () => {
      campaignFindByIdMock.mockResolvedValue(activeCampaign);
      const donations = [pendingDonation, { ...pendingDonation, _id: "don2" }];
      donationFindMock.mockReturnValue({
        populate: jest.fn().mockResolvedValue(donations),
      });

      const req = {
        user: { _id: ngoUserId },
        params: { campaignId },
      };
      const res = makeRes();

      await getCampaignDonations(req, res);

      expect(donationFindMock).toHaveBeenCalledWith({ campaignId });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          donations,
        })
      );
    });

    test("should return empty array when no donations exist", async () => {
      campaignFindByIdMock.mockResolvedValue(activeCampaign);
      donationFindMock.mockReturnValue({
        populate: jest.fn().mockResolvedValue([]),
      });

      const req = { user: { _id: ngoUserId }, params: { campaignId } };
      const res = makeRes();

      await getCampaignDonations(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ donations: [] })
      );
    });

    test("should populate donorId with name and email", async () => {
      campaignFindByIdMock.mockResolvedValue(activeCampaign);
      const populateMock = jest.fn().mockResolvedValue([]);
      donationFindMock.mockReturnValue({ populate: populateMock });

      const req = { user: { _id: ngoUserId }, params: { campaignId } };
      const res = makeRes();

      await getCampaignDonations(req, res);

      expect(populateMock).toHaveBeenCalledWith("donorId", "name email");
    });

    test("should return 500 on database error", async () => {
      campaignFindByIdMock.mockResolvedValue(activeCampaign);
      donationFindMock.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("DB error")),
      });

      const req = { user: { _id: ngoUserId }, params: { campaignId } };
      const res = makeRes();

      await getCampaignDonations(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Failed to fetch donations",
        })
      );
    });
  });

  // ═══════════════════════════════════════════
  // verifyDonation
  // ═══════════════════════════════════════════
  describe("verifyDonation", () => {
    test("should return 404 when donation does not exist", async () => {
      donationFindByIdMock.mockResolvedValue(null);

      const req = {
        user: { _id: ngoUserId },
        params: { donationId: "nonexistent" },
        body: { confirmedAmount: 500, status: "Verified" },
      };
      const res = makeRes();

      await verifyDonation(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Donation not found" })
      );
    });

    test("should return 400 when donation is already processed", async () => {
      const alreadyVerified = { ...pendingDonation, status: "Verified" };
      donationFindByIdMock.mockResolvedValue(alreadyVerified);

      const req = {
        user: { _id: ngoUserId },
        params: { donationId },
        body: { confirmedAmount: 500, status: "Verified" },
      };
      const res = makeRes();

      await verifyDonation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "This donation has already been processed",
        })
      );
    });

    test("should return 400 when donation was previously rejected", async () => {
      const rejected = { ...pendingDonation, status: "Rejected" };
      donationFindByIdMock.mockResolvedValue(rejected);

      const req = {
        user: { _id: ngoUserId },
        params: { donationId },
        body: { confirmedAmount: 0, status: "Verified" },
      };
      const res = makeRes();

      await verifyDonation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return 404 when parent campaign not found", async () => {
      donationFindByIdMock.mockResolvedValue({ ...pendingDonation });
      campaignFindByIdMock.mockResolvedValue(null);

      const req = {
        user: { _id: ngoUserId },
        params: { donationId },
        body: { confirmedAmount: 500, status: "Verified" },
      };
      const res = makeRes();

      await verifyDonation(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Parent campaign not found" })
      );
    });

    test("should return 403 when NGO does not own the parent campaign", async () => {
      donationFindByIdMock.mockResolvedValue({
        ...pendingDonation,
        save: jest.fn(),
      });
      campaignFindByIdMock.mockResolvedValue({
        ...activeCampaign,
        ngoId: { equals: (id) => id === otherUserId },
      });

      const req = {
        user: { _id: ngoUserId },
        params: { donationId },
        body: { confirmedAmount: 500, status: "Verified" },
      };
      const res = makeRes();

      await verifyDonation(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "You can only verify donations for your own campaigns",
        })
      );
    });

    test("should verify donation and increment raisedAmount with $inc", async () => {
      const saveable = { ...pendingDonation, save: jest.fn() };
      saveable.save.mockResolvedValue(saveable);
      donationFindByIdMock.mockResolvedValue(saveable);
      campaignFindByIdMock.mockResolvedValue(activeCampaign);
      campaignFindByIdAndUpdateMock.mockResolvedValue({});

      const req = {
        user: { _id: ngoUserId },
        params: { donationId },
        body: { confirmedAmount: 750, status: "Verified" },
      };
      const res = makeRes();

      await verifyDonation(req, res);

      expect(saveable.status).toBe("Verified");
      expect(saveable.save).toHaveBeenCalled();
      expect(campaignFindByIdAndUpdateMock).toHaveBeenCalledWith(campaignId, {
        $inc: { raisedAmount: 750 },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Donation verified successfully",
        })
      );
    });

    test("should NOT increment raisedAmount when confirmedAmount is 0", async () => {
      const saveable = { ...pendingDonation, save: jest.fn() };
      saveable.save.mockResolvedValue(saveable);
      donationFindByIdMock.mockResolvedValue(saveable);
      campaignFindByIdMock.mockResolvedValue(activeCampaign);

      const req = {
        user: { _id: ngoUserId },
        params: { donationId },
        body: { confirmedAmount: 0, status: "Verified" },
      };
      const res = makeRes();

      await verifyDonation(req, res);

      expect(campaignFindByIdAndUpdateMock).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("should NOT increment raisedAmount when status is Rejected", async () => {
      const saveable = { ...pendingDonation, save: jest.fn() };
      saveable.save.mockResolvedValue(saveable);
      donationFindByIdMock.mockResolvedValue(saveable);
      campaignFindByIdMock.mockResolvedValue(activeCampaign);

      const req = {
        user: { _id: ngoUserId },
        params: { donationId },
        body: { confirmedAmount: 500, status: "Rejected" },
      };
      const res = makeRes();

      await verifyDonation(req, res);

      expect(saveable.status).toBe("Rejected");
      expect(campaignFindByIdAndUpdateMock).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Donation rejected successfully",
        })
      );
    });

    test("should return 500 when donation save throws", async () => {
      const saveable = { ...pendingDonation, save: jest.fn() };
      saveable.save.mockRejectedValue(new Error("Save error"));
      donationFindByIdMock.mockResolvedValue(saveable);
      campaignFindByIdMock.mockResolvedValue(activeCampaign);

      const req = {
        user: { _id: ngoUserId },
        params: { donationId },
        body: { confirmedAmount: 100, status: "Verified" },
      };
      const res = makeRes();

      await verifyDonation(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Failed to verify donation",
        })
      );
    });
  });
});
