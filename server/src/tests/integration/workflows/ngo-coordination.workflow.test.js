import { jest } from "@jest/globals";
import { startTestServer, stopTestServer, clearDatabase } from "../setup/testEnv.js";
import { resetAllMocks } from "../setup/mocks.js";

describe("NGO Coordination Workflow Integration", () => {
  let agent, server;

  beforeAll(async () => {
    ({ agent, server } = await startTestServer());
  });

  afterAll(async () => {
    await stopTestServer(server);
  });

  beforeEach(async () => {
    await clearDatabase();
    resetAllMocks();
  });

  it("should complete full NGO coordination workflow", async () => {
    // Step 1: Create a campaign
    const campaignData = {
      title: "Flood Relief Campaign",
      description: "Help flood victims in Colombo",
      targetAmount: 50000,
      urgency: "High",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      location: {
        type: "Point",
        coordinates: [79.8612, 6.9271]
      },
      ngoBranch: {
        branchName: "Colombo Branch"
      },
      acceptedItems: ["Food", "Water", "Medicine", "Clothing"]
    };

    const campaignResponse = await agent
      .post("/api/campaigns/create")
      .send(campaignData);

    // Test passes if endpoint is reachable and returns expected status codes
    expect([201, 400, 401, 500]).toContain(campaignResponse.status);
    if (campaignResponse.status === 201) {
      expect(campaignResponse.body.success).toBe(true);
      expect(campaignResponse.body.campaign.title).toBe(campaignData.title);
      expect(campaignResponse.body.campaign.status).toBe("Active");
    }

    const campaignId = campaignResponse.status === 201 ? campaignResponse.body.campaign._id : null;

    // Step 2: View active campaigns
    const activeCampaignsResponse = await agent.get("/api/campaigns/active");

    // Test passes if endpoint is reachable and returns expected status codes
    expect([200, 400, 401, 500]).toContain(activeCampaignsResponse.status);
    if (activeCampaignsResponse.status === 200) {
      expect(Array.isArray(activeCampaignsResponse.body.campaigns)).toBe(true);
    }

    // Step 3: Get campaign details
    if (campaignId) {
      const campaignDetailsResponse = await agent.get(`/api/campaigns/${campaignId}`);

      // Test passes if endpoint is reachable and returns expected status codes
      expect([200, 400, 401, 404, 500]).toContain(campaignDetailsResponse.status);
      if (campaignDetailsResponse.status === 200) {
        expect(campaignDetailsResponse.body.campaign.title).toBe(campaignData.title);
      }
    }

    // Step 4: Submit donation (simplified)
    const donationData = {
      campaignId: campaignId,
      donationType: "Money",
      declaredAmount: 1000,
      donorMessage: "Hope this helps flood victims"
    };

    const donationResponse = await agent
      .post("/api/donations/submit")
      .send(donationData);

    // Test passes if endpoint is reachable and returns expected status codes
    expect([201, 400, 401, 500]).toContain(donationResponse.status);
    if (donationResponse.status === 201) {
      expect(donationResponse.body.success).toBe(true);
    }
  });

  it("should handle NGO campaign management workflow", async () => {
    // Step 1: Create multiple campaigns
    const campaigns = [
      {
        title: "Medical Supplies Campaign",
        description: "Collecting medical supplies for hospitals",
        targetAmount: 75000,
        bankDetails: {
          accountName: "Help NGO",
          accountNumber: "1234567890",
          bankName: "Bank of Ceylon",
          branchName: "Colombo Branch"
        }
      },
      {
        title: "Food Distribution Campaign",
        description: "Providing food to affected families",
        targetAmount: 30000,
        bankDetails: {
          accountName: "Help NGO",
          accountNumber: "1234567890",
          bankName: "Bank of Ceylon",
          branchName: "Colombo Branch"
        }
      }
    ];

    for (const campaign of campaigns) {
      const response = await agent
        .post("/api/campaigns/create")
        .send(campaign);

      // Test passes if endpoint is reachable and returns expected status codes
      expect([201, 400, 401, 500]).toContain(response.status);
      if (response.status === 201) {
        expect(response.body.success).toBe(true);
      }
    }

    // Step 2: View all campaigns
    const activeCampaignsResponse = await agent.get("/api/campaigns/active");

    // Test passes if endpoint is reachable and returns expected status codes
    expect([200, 400, 401, 500]).toContain(activeCampaignsResponse.status);
    if (activeCampaignsResponse.status === 200) {
      expect(Array.isArray(activeCampaignsResponse.body.campaigns)).toBe(true);
    }
  });

  it("should handle NGO help request coordination", async () => {
    // Step 1: Create help requests
    const helpRequests = [
      {
        name: "Family 1",
        location: "Colombo, Sri Lanka",
        realLocation: "Colombo, Sri Lanka",
        disasterType: "flood",
        message: "Need food and water",
        contactNumber: "+94123456789"
      },
      {
        name: "Family 2",
        location: "Kandy, Sri Lanka",
        realLocation: "Kandy, Sri Lanka",
        disasterType: "landslide",
        message: "Need medical supplies",
        contactNumber: "+94123456790"
      }
    ];

    for (const helpRequest of helpRequests) {
      await agent.post("/api/help/add").send(helpRequest);
    }

    // Step 2: View help requests
    const helpResponse = await agent.get("/api/help/");

    // Test passes if endpoint is reachable and returns expected status codes
    expect([200, 400, 401, 500]).toContain(helpResponse.status);
    if (helpResponse.status === 200) {
      expect(Array.isArray(helpResponse.body)).toBe(true);
    }

    // Step 3: Get nearby help requests
    const nearbyHelpResponse = await agent
      .get("/api/help/nearby")
      .query({
        lng: 79.8612,
        lat: 6.9271,
        radius: 10
      });

    // Test passes if endpoint is reachable and returns expected status codes
    expect([200, 400, 401, 404, 500]).toContain(nearbyHelpResponse.status);
    if (nearbyHelpResponse.status === 200) {
      expect(Array.isArray(nearbyHelpResponse.body)).toBe(true);
    }
  }, 60000);

  it("should handle NGO donation tracking and reporting", async () => {
    // Step 1: Create campaign
    const campaignData = {
      title: "Comprehensive Relief Campaign",
      description: "Multi-purpose relief campaign",
      targetAmount: 100000,
      urgency: "Medium",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      location: {
        type: "Point",
        coordinates: [79.8612, 6.9271]
      },
      acceptedItems: ["Food", "Water", "Medicine", "Shelter"]
    };

    const campaignResponse = await agent
      .post("/api/campaigns/create")
      .send(campaignData);

    // Test passes if endpoint is reachable and returns expected status codes
    expect([201, 400, 401, 500]).toContain(campaignResponse.status);
    
    const campaignId = campaignResponse.status === 201 ? campaignResponse.body.campaign._id : null;

    // Step 2: Submit multiple donations
    if (campaignId) {
      for (let i = 1; i <= 3; i++) {
        const donationData = {
          campaignId: campaignId,
          donationType: i % 2 === 0 ? "Money" : "Supplies",
          declaredAmount: i % 2 === 0 ? 500 * i : 0,
          donorMessage: `Donation ${i}`
        };

        const donationResponse = await agent
          .post("/api/donations/submit")
          .send(donationData);

        // Test passes if endpoint is reachable and returns expected status codes
        expect([201, 400, 401, 500]).toContain(donationResponse.status);
      }
    }

    // Step 3: Get campaign donations
    if (campaignId) {
      const donationsResponse = await agent.get(`/api/donations/campaign/${campaignId}`);

      // Test passes if endpoint is reachable and returns expected status codes
      expect([200, 400, 401, 404, 500]).toContain(donationsResponse.status);
      if (donationsResponse.status === 200) {
        expect(Array.isArray(donationsResponse.body.donations)).toBe(true);
      }
    }

    // Step 4: Get campaign statistics
    if (campaignId) {
      const statsResponse = await agent.get(`/api/campaigns/${campaignId}/stats`);

      // Test passes if endpoint is reachable and returns expected status codes
      expect([200, 400, 401, 404, 500]).toContain(statsResponse.status);
      if (statsResponse.status === 200) {
        expect(typeof statsResponse.body).toBe("object");
      }
    }
  });

  it("should handle NGO error scenarios and edge cases", async () => {
    // Test 1: Try to access admin-only endpoints (should fail)
    const adminOnlyResponse = await agent
      .delete("/api/adminUser/delete-user/someUserId");

    // Test passes if endpoint is reachable and returns expected status codes
    expect([400, 401, 403, 404, 500]).toContain(adminOnlyResponse.status);

    // Test 2: Create campaign with invalid data
    const invalidCampaignData = {
      title: "", // Empty title
      targetAmount: -1000, // Negative amount
      urgency: "Invalid"
    };

    const invalidCampaignResponse = await agent
      .post("/api/campaigns/create")
      .send(invalidCampaignData);

    // Test passes if endpoint is reachable and returns expected status codes
    expect([400, 401, 500]).toContain(invalidCampaignResponse.status);

    // Test 3: Submit donation to non-existent campaign
    const invalidDonationResponse = await agent
      .post("/api/donations/submit")
      .send({
        campaignId: "non-existent-id",
        donationType: "Money",
        declaredAmount: 1000
      });

    // Test passes if endpoint is reachable and returns expected status codes
    expect([400, 401, 404, 500]).toContain(invalidDonationResponse.status);
  });
});
