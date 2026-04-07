import {
  createCampaignSchema,
  updateCampaignSchema,
  submitDonationSchema,
  verifyDonationSchema,
} from "../../../validators/campaign.schema.js";

// helper – returns value or error from Joi validation
const validate = (schema, data) => schema.validate(data, { abortEarly: true, stripUnknown: true });

describe("Campaign & Donation Joi Schemas", () => {
  // ═══════════════════════════════════════════
  // createCampaignSchema
  // ═══════════════════════════════════════════
  describe("createCampaignSchema", () => {
    const validData = {
      title: "Flood Relief Fund",
      description: "A campaign to help flood victims across southern regions",
      targetAmount: 500000,
      bankDetails: {
        accountName: "RescueNet NGO",
        accountNumber: "1234567890",
        bankName: "Bank of Ceylon",
        branchName: "Colombo",
      },
    };

    test("should pass with all valid required fields", () => {
      const { error, value } = validate(createCampaignSchema, validData);
      expect(error).toBeUndefined();
      expect(value.title).toBe("Flood Relief Fund");
    });

    test("should pass with optional acceptedItems", () => {
      const { error, value } = validate(createCampaignSchema, {
        ...validData,
        acceptedItems: ["Clothes", "Water"],
      });
      expect(error).toBeUndefined();
      expect(value.acceptedItems).toEqual(["Clothes", "Water"]);
    });

    test("should fail when title is missing", () => {
      const { error } = validate(createCampaignSchema, { ...validData, title: undefined });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain("title");
    });

    test("should fail when title is shorter than 3 characters", () => {
      const { error } = validate(createCampaignSchema, { ...validData, title: "AB" });
      expect(error).toBeDefined();
    });

    test("should fail when description is missing", () => {
      const { error } = validate(createCampaignSchema, { ...validData, description: undefined });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain("description");
    });

    test("should fail when description is shorter than 10 characters", () => {
      const { error } = validate(createCampaignSchema, { ...validData, description: "Short" });
      expect(error).toBeDefined();
    });

    test("should fail when targetAmount is missing", () => {
      const { error } = validate(createCampaignSchema, { ...validData, targetAmount: undefined });
      expect(error).toBeDefined();
    });

    test("should fail when targetAmount is zero or negative", () => {
      const { error: e1 } = validate(createCampaignSchema, { ...validData, targetAmount: 0 });
      expect(e1).toBeDefined();

      const { error: e2 } = validate(createCampaignSchema, { ...validData, targetAmount: -100 });
      expect(e2).toBeDefined();
    });

    test("should fail when bankDetails is missing", () => {
      const { error } = validate(createCampaignSchema, { ...validData, bankDetails: undefined });
      expect(error).toBeDefined();
    });

    test("should fail when bankDetails.accountName is missing", () => {
      const { error } = validate(createCampaignSchema, {
        ...validData,
        bankDetails: { ...validData.bankDetails, accountName: undefined },
      });
      expect(error).toBeDefined();
    });

    test("should fail when bankDetails.accountNumber is missing", () => {
      const { error } = validate(createCampaignSchema, {
        ...validData,
        bankDetails: { ...validData.bankDetails, accountNumber: undefined },
      });
      expect(error).toBeDefined();
    });

    test("should fail when bankDetails.bankName is missing", () => {
      const { error } = validate(createCampaignSchema, {
        ...validData,
        bankDetails: { ...validData.bankDetails, bankName: undefined },
      });
      expect(error).toBeDefined();
    });

    test("should fail when bankDetails.branchName is missing", () => {
      const { error } = validate(createCampaignSchema, {
        ...validData,
        bankDetails: { ...validData.bankDetails, branchName: undefined },
      });
      expect(error).toBeDefined();
    });

    test("should strip unknown fields", () => {
      const { error, value } = validate(createCampaignSchema, {
        ...validData,
        hackerField: "injected",
      });
      expect(error).toBeUndefined();
      expect(value.hackerField).toBeUndefined();
    });

    test("should trim title and description", () => {
      const { value } = validate(createCampaignSchema, {
        ...validData,
        title: "  Trimmed Title  ",
        description: "  A valid description that is long enough  ",
      });
      expect(value.title).toBe("Trimmed Title");
      expect(value.description).toBe("A valid description that is long enough");
    });
  });

  // ═══════════════════════════════════════════
  // updateCampaignSchema
  // ═══════════════════════════════════════════
  describe("updateCampaignSchema", () => {
    test("should pass with no fields (all optional)", () => {
      const { error } = validate(updateCampaignSchema, {});
      expect(error).toBeUndefined();
    });

    test("should pass with only title", () => {
      const { error, value } = validate(updateCampaignSchema, { title: "New Title" });
      expect(error).toBeUndefined();
      expect(value.title).toBe("New Title");
    });

    test("should pass with valid status", () => {
      const { error } = validate(updateCampaignSchema, { status: "Completed" });
      expect(error).toBeUndefined();
    });

    test("should accept all valid status values", () => {
      for (const s of ["Active", "Completed", "Cancelled"]) {
        const { error } = validate(updateCampaignSchema, { status: s });
        expect(error).toBeUndefined();
      }
    });

    test("should fail with invalid status", () => {
      const { error } = validate(updateCampaignSchema, { status: "Archived" });
      expect(error).toBeDefined();
    });

    test("should fail when title is too short", () => {
      const { error } = validate(updateCampaignSchema, { title: "AB" });
      expect(error).toBeDefined();
    });

    test("should fail when description is too short", () => {
      const { error } = validate(updateCampaignSchema, { description: "Short" });
      expect(error).toBeDefined();
    });

    test("should pass with bankDetails object", () => {
      const { error } = validate(updateCampaignSchema, {
        bankDetails: {
          accountName: "A",
          accountNumber: "123",
          bankName: "B",
          branchName: "C",
        },
      });
      expect(error).toBeUndefined();
    });

    test("should fail when bankDetails is partial (missing required sub-fields)", () => {
      const { error } = validate(updateCampaignSchema, {
        bankDetails: { accountName: "A" },
      });
      expect(error).toBeDefined();
    });
  });

  // ═══════════════════════════════════════════
  // submitDonationSchema
  // ═══════════════════════════════════════════
  describe("submitDonationSchema", () => {
    const validDonation = {
      campaignId: "64f1a2b3c4d5e6f7a8b9c0d1",
      donationType: "Money",
      declaredAmount: 500,
    };

    test("should pass with valid required fields", () => {
      const { error } = validate(submitDonationSchema, validDonation);
      expect(error).toBeUndefined();
    });

    test("should pass with optional donorMessage", () => {
      const { error, value } = validate(submitDonationSchema, {
        ...validDonation,
        donorMessage: "Good luck!",
      });
      expect(error).toBeUndefined();
      expect(value.donorMessage).toBe("Good luck!");
    });

    test("should allow empty string for donorMessage", () => {
      const { error } = validate(submitDonationSchema, { ...validDonation, donorMessage: "" });
      expect(error).toBeUndefined();
    });

    test("should default declaredAmount to 0 when not provided", () => {
      const { error, value } = validate(submitDonationSchema, {
        campaignId: "abc",
        donationType: "Supplies",
      });
      expect(error).toBeUndefined();
      expect(value.declaredAmount).toBe(0);
    });

    test("should fail when campaignId is missing", () => {
      const { error } = validate(submitDonationSchema, { donationType: "Money" });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain("campaignId");
    });

    test("should fail when donationType is missing", () => {
      const { error } = validate(submitDonationSchema, { campaignId: "abc" });
      expect(error).toBeDefined();
    });

    test("should fail with invalid donationType", () => {
      const { error } = validate(submitDonationSchema, {
        ...validDonation,
        donationType: "Bitcoin",
      });
      expect(error).toBeDefined();
    });

    test("should accept Money and Supplies as valid donationType", () => {
      for (const t of ["Money", "Supplies"]) {
        const { error } = validate(submitDonationSchema, { ...validDonation, donationType: t });
        expect(error).toBeUndefined();
      }
    });

    test("should fail when declaredAmount is negative", () => {
      const { error } = validate(submitDonationSchema, { ...validDonation, declaredAmount: -10 });
      expect(error).toBeDefined();
    });

    test("should fail when donorMessage exceeds 500 characters", () => {
      const { error } = validate(submitDonationSchema, {
        ...validDonation,
        donorMessage: "x".repeat(501),
      });
      expect(error).toBeDefined();
    });
  });

  // ═══════════════════════════════════════════
  // verifyDonationSchema
  // ═══════════════════════════════════════════
  describe("verifyDonationSchema", () => {
    test("should pass with valid Verified status", () => {
      const { error } = validate(verifyDonationSchema, {
        confirmedAmount: 1000,
        status: "Verified",
      });
      expect(error).toBeUndefined();
    });

    test("should pass with valid Rejected status", () => {
      const { error } = validate(verifyDonationSchema, {
        confirmedAmount: 0,
        status: "Rejected",
      });
      expect(error).toBeUndefined();
    });

    test("should fail when confirmedAmount is missing", () => {
      const { error } = validate(verifyDonationSchema, { status: "Verified" });
      expect(error).toBeDefined();
    });

    test("should fail when status is missing", () => {
      const { error } = validate(verifyDonationSchema, { confirmedAmount: 100 });
      expect(error).toBeDefined();
    });

    test("should fail with invalid status", () => {
      const { error } = validate(verifyDonationSchema, {
        confirmedAmount: 100,
        status: "Pending",
      });
      expect(error).toBeDefined();
    });

    test("should fail when confirmedAmount is negative", () => {
      const { error } = validate(verifyDonationSchema, {
        confirmedAmount: -50,
        status: "Verified",
      });
      expect(error).toBeDefined();
    });

    test("should allow confirmedAmount of 0", () => {
      const { error } = validate(verifyDonationSchema, {
        confirmedAmount: 0,
        status: "Verified",
      });
      expect(error).toBeUndefined();
    });

    test("should strip unknown fields", () => {
      const { error, value } = validate(verifyDonationSchema, {
        confirmedAmount: 100,
        status: "Verified",
        extra: "nope",
      });
      expect(error).toBeUndefined();
      expect(value.extra).toBeUndefined();
    });
  });
});
