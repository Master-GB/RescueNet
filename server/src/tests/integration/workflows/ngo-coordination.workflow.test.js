import { jest } from "@jest/globals";
import { startTestServer, stopTestServer, clearDatabase } from "../setup/testEnv.js";
import { resetAllMocks, mockHttpClient } from "../setup/mocks.js";
import User from "../../models/user.js";

describe("NGO Coordination Workflow Integration", () => {
  let agent, server, ngoCookie, adminCookie, citizenCookie;

  beforeAll(async () => {
    ({ agent, server } = await startTestServer());
  });

  afterAll(async () => {
    await stopTestServer(server);
  });

  beforeEach(async () => {
    await clearDatabase();
    resetAllMocks();

    // Create and login as NGO user
    const ngoData = {
      name: "Help NGO",
      email: "ngo@help.org",
      password: "password123",
      role: "NGO"
    };

    await agent.post("/api/auth/register").send(ngoData);
    await User.findOneAndUpdate(
      { email: ngoData.email },
      { isAccountVerified: true }
    );

    const ngoLogin = await agent
      .post("/api/auth/login")
      .send({
        email: ngoData.email,
        password: ngoData.password
      });

    ngoCookie = ngoLogin.headers["set-cookie"];

    // Create and login as admin user
    const adminData = {
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      role: "ADMIN"
    };

    await agent.post("/api/auth/register").send(adminData);
    await User.findOneAndUpdate(
      { email: adminData.email },
      { isAccountVerified: true }
    );

    const adminLogin = await agent
      .post("/api/auth/login")
      .send({
        email: adminData.email,
        password: adminData.password
      });

    adminCookie = adminLogin.headers["set-cookie"];

    // Create and login as citizen user
    const citizenData = {
      name: "Citizen User",
      email: "citizen@example.com",
      password: "password123",
      role: "CITIZEN"
    };

    await agent.post("/api/auth/register").send(citizenData);
    await User.findOneAndUpdate(
      { email: citizenData.email },
      { isAccountVerified: true }
    );

    const citizenLogin = await agent
      .post("/api/auth/login")
      .send({
        email: citizenData.email,
        password: citizenData.password
      });

    citizenCookie = citizenLogin.headers["set-cookie"];
  });

  it("should complete full NGO coordination workflow", async () => {
    // Step 1: NGO creates a campaign
    const campaignData = {
      title: "Flood Relief Campaign",
      description: "Helping flood victims in Colombo area with essential supplies",
      targetAmount: 50000,
      bankDetails: {
        accountName: "Help NGO",
        accountNumber: "1234567890",
        bankName: "Bank of Ceylon",
        branchName: "Colombo Branch"
      },
      acceptedItems: ["Food", "Water", "Medicine", "Clothing"]
    };

    const campaignResponse = await agent
      .post("/api/campaigns/create")
      .set("Cookie", ngoCookie)
      .send(campaignData);

    expect(campaignResponse.status).toBe(201);
    expect(campaignResponse.body.success).toBe(true);
    expect(campaignResponse.body.campaign.title).toBe(campaignData.title);
    expect(campaignResponse.body.campaign.status).toBe("Active");

    const campaignId = campaignResponse.body.campaign._id;

    // Step 2: Citizen views active campaigns
    const activeCampaignsResponse = await agent
      .get("/api/campaigns/active");

    expect(activeCampaignsResponse.status).toBe(200);
    expect(activeCampaignsResponse.body.campaigns).toHaveLength(1);
    expect(activeCampaignsResponse.body.campaigns[0].title).toBe(campaignData.title);

    // Step 3: Citizen gets specific campaign details
    const campaignDetailsResponse = await agent
      .get(`/api/campaigns/${campaignId}`);

    expect(campaignDetailsResponse.status).toBe(200);
    expect(campaignDetailsResponse.body.campaign.title).toBe(campaignData.title);
    expect(campaignDetailsResponse.body.campaign.ngoId.name).toBe("Help NGO");

    // Step 4: Citizen submits a donation
    const donationData = {
      campaignId: campaignId,
      donationType: "Money",
      declaredAmount: 1000,
      donorMessage: "Hope this helps the flood victims"
    };

    // Mock file upload for donation proof
    const donationResponse = await agent
      .post("/api/donations/submit")
      .set("Cookie", citizenCookie)
      .field(donationData)
      .attach("proofImage", Buffer.from("fake-image-data"), "proof.jpg");

    expect(donationResponse.status).toBe(201);
    expect(donationResponse.body.success).toBe(true);
    expect(donationResponse.body.donation.donationType).toBe("Money");
    expect(donationResponse.body.donation.declaredAmount).toBe(1000);

    const donationId = donationResponse.body.donation._id;

    // Step 5: NGO views campaign donations
    const campaignDonationsResponse = await agent
      .get(`/api/donations/campaign/${campaignId}`)
      .set("Cookie", ngoCookie);

    expect(campaignDonationsResponse.status).toBe(200);
    expect(campaignDonationsResponse.body.donations).toHaveLength(1);
    expect(campaignDonationsResponse.body.donations[0].donorId.name).toBe("Citizen User");

    // Step 6: NGO verifies the donation
    const verifyData = {
      confirmedAmount: 1000,
      status: "Verified"
    };

    const verifyResponse = await agent
      .put(`/api/donations/verify/${donationId}`)
      .set("Cookie", ngoCookie)
      .send(verifyData);

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body.success).toBe(true);
    expect(verifyResponse.body.donation.status).toBe("Verified");

    // Step 7: NGO views updated campaign with raised amount
    const updatedCampaignResponse = await agent
      .get(`/api/campaigns/${campaignId}`);

    expect(updatedCampaignResponse.status).toBe(200);
    expect(updatedCampaignResponse.body.campaign.raisedAmount).toBe(1000);

    // Step 8: Admin verifies NGO status
    const adminVerifyResponse = await agent
      .patch("/api/adminUser/verify-ngo/ngo")
      .set("Cookie", adminCookie);

    expect(adminVerifyResponse.status).toBe(200);
    expect(adminVerifyResponse.body.success).toBe(true);

    // Step 9: NGO creates another campaign for supplies
    const suppliesCampaignData = {
      title: "Emergency Supplies Campaign",
      description: "Collecting emergency supplies for affected families",
      targetAmount: 25000,
      bankDetails: {
        accountName: "Help NGO",
        accountNumber: "1234567890",
        bankName: "Bank of Ceylon",
        branchName: "Colombo Branch"
      },
      acceptedItems: ["Blankets", "Tents", "Flashlights", "Batteries"]
    };

    const suppliesCampaignResponse = await agent
      .post("/api/campaigns/create")
      .set("Cookie", ngoCookie)
      .send(suppliesCampaignData);

    expect(suppliesCampaignResponse.status).toBe(201);
    expect(suppliesCampaignResponse.body.campaign.title).toBe(suppliesCampaignData.title);

    // Step 10: NGO monitors help requests
    // Create a help request first
    const helpRequestData = {
      name: "Family in Need",
      location: "Colombo, Sri Lanka",
      realLocation: "Colombo, Sri Lanka",
      disasterType: "flood",
      message: "Family of 5 needs emergency supplies",
      contactNumber: "+94123456789"
    };

    await agent
      .post("/api/help/add")
      .set("Cookie", citizenCookie)
      .send(helpRequestData);

    // NGO views help requests
    const ngoHelpResponse = await agent
      .get("/api/ngo/help-requests")
      .set("Cookie", ngoCookie);

    expect(ngoHelpResponse.status).toBe(200);
    expect(Array.isArray(ngoHelpResponse.body)).toBe(true);
  });

  it("should handle NGO campaign management workflow", async () => {
    // Step 1: NGO creates multiple campaigns
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
        .set("Cookie", ngoCookie)
        .send(campaign);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    }

    // Step 2: NGO views all their campaigns
    const activeCampaignsResponse = await agent
      .get("/api/campaigns/active");

    expect(activeCampaignsResponse.status).toBe(200);
    expect(activeCampaignsResponse.body.campaigns).toHaveLength(2);

    // Step 3: NGO updates a campaign
    const updateResponse = await agent
      .put(`/api/campaigns/update/${activeCampaignsResponse.body.campaigns[0]._id}`)
      .set("Cookie", ngoCookie)
      .send({
        description: "Updated: Collecting critical medical supplies for emergency response",
        targetAmount: 100000
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.success).toBe(true);
    expect(updateResponse.body.campaign.description).toContain("Updated");
    expect(updateResponse.body.campaign.targetAmount).toBe(100000);

    // Step 4: NGO processes multiple donations
    const campaignId = activeCampaignsResponse.body.campaigns[0]._id;
    
    for (let i = 1; i <= 3; i++) {
      const donationData = {
        campaignId: campaignId,
        donationType: i % 2 === 0 ? "Money" : "Supplies",
        declaredAmount: i % 2 === 0 ? 500 * i : 0,
        donorMessage: `Donation ${i}`
      };

      const donationResponse = await agent
        .post("/api/donations/submit")
        .set("Cookie", citizenCookie)
        .field(donationData)
        .attach("proofImage", Buffer.from(`fake-image-${i}`), `proof-${i}.jpg`);

      expect(donationResponse.status).toBe(201);

      // NGO verifies each donation
      const verifyData = {
        confirmedAmount: i % 2 === 0 ? 500 * i : 0,
        status: "Verified"
      };

      const verifyResponse = await agent
        .put(`/api/donations/verify/${donationResponse.body.donation._id}`)
        .set("Cookie", ngoCookie)
        .send(verifyData);

      expect(verifyResponse.status).toBe(200);
    }

    // Step 5: NGO checks final campaign status
    const finalCampaignResponse = await agent
      .get(`/api/campaigns/${campaignId}`);

    expect(finalCampaignResponse.status).toBe(200);
    expect(finalCampaignResponse.body.campaign.raisedAmount).toBeGreaterThan(0);
  });

  it("should handle NGO help request coordination", async () => {
    // Step 1: Multiple citizens create help requests
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

    const createdRequests = [];
    for (const help of helpRequests) {
      const response = await agent
        .post("/api/help/add")
        .set("Cookie", citizenCookie)
        .send(help);

      expect(response.status).toBe(201);
      createdRequests.push(response.body);
    }

    // Step 2: NGO views assigned help requests
    const ngoHelpResponse = await agent
      .get("/api/ngo/help-requests")
      .set("Cookie", ngoCookie);

    expect(ngoHelpResponse.status).toBe(200);
    expect(Array.isArray(ngoHelpResponse.body)).toBe(true);

    // Step 3: NGO updates help request status
    if (ngoHelpResponse.body.length > 0) {
      const helpRequestId = ngoHelpResponse.body[0]._id;
      
      const updateResponse = await agent
        .put(`/api/help/update/${helpRequestId}`)
        .set("Cookie", ngoCookie)
        .send({
          status: "in-progress",
          adminNotes: "NGO responding to provide assistance"
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.status).toBe("in-progress");
    }

    // Step 4: NGO creates shelter for affected people
    const shelterData = {
      name: "NGO Emergency Shelter",
      description: "Temporary shelter managed by NGO",
      shelterType: "COMMUNITY_HALL",
      address: {
        street: "456 Relief Ave",
        city: "Colombo",
        province: "Western",
        postalCode: "00100"
      },
      contact: {
        phone: "+94123456791",
        email: "shelter@help.org"
      },
      location: {
        type: "Point",
        coordinates: [79.8612, 6.9271]
      },
      capacity: {
        total: 50
      },
      supports: {
        disasterTypes: ["FLOOD", "LANDSLIDE"],
        wheelchairAccess: true,
        medical: true,
        food: true,
        water: true,
        power: true
      }
    };

    const shelterResponse = await agent
      .post("/api/shelters/create")
      .set("Cookie", ngoCookie)
      .send(shelterData);

    expect(shelterResponse.status).toBe(201);
    expect(shelterResponse.body.shelter.name).toBe(shelterData.name);

    // Step 5: NGO monitors nearby help requests
    const nearbyHelpResponse = await agent
      .get("/api/help/")
      .query({
        location: "Colombo",
        radius: 10
      });

    expect(nearbyHelpResponse.status).toBe(200);
    expect(Array.isArray(nearbyHelpResponse.body)).toBe(true);
  });

  it("should handle NGO donation tracking and reporting", async () => {
    // Step 1: NGO creates campaign
    const campaignData = {
      title: "Comprehensive Relief Campaign",
      description: "Multi-purpose relief campaign",
      targetAmount: 100000,
      bankDetails: {
        accountName: "Help NGO",
        accountNumber: "1234567890",
        bankName: "Bank of Ceylon",
        branchName: "Colombo Branch"
      }
    };

    const campaignResponse = await agent
      .post("/api/campaigns/create")
      .set("Cookie", ngoCookie)
      .send(campaignData);

    expect(campaignResponse.status).toBe(201);
    const campaignId = campaignResponse.body.campaign._id;

    // Step 2: Multiple citizens submit donations
    const donations = [
      { type: "Money", amount: 5000 },
      { type: "Supplies", amount: 0 },
      { type: "Money", amount: 2500 },
      { type: "Supplies", amount: 0 }
    ];

    for (let i = 0; i < donations.length; i++) {
      const donationData = {
        campaignId: campaignId,
        donationType: donations[i].type,
        declaredAmount: donations[i].amount,
        donorMessage: `Donation ${i + 1}`
      };

      const donationResponse = await agent
        .post("/api/donations/submit")
        .set("Cookie", citizenCookie)
        .field(donationData)
        .attach("proofImage", Buffer.from(`donation-${i + 1}`), `proof-${i + 1}.jpg`);

      expect(donationResponse.status).toBe(201);
    }

    // Step 3: NGO views all donations for campaign
    const donationsResponse = await agent
      .get(`/api/donations/campaign/${campaignId}`)
      .set("Cookie", ngoCookie);

    expect(donationsResponse.status).toBe(200);
    expect(donationsResponse.body.donations).toHaveLength(4);

    // Step 4: NGO processes donations with different statuses
    let totalVerified = 0;
    for (const donation of donationsResponse.body.donations) {
      const verifyData = {
        confirmedAmount: donation.declaredAmount,
        status: Math.random() > 0.3 ? "Verified" : "Rejected"
      };

      const verifyResponse = await agent
        .put(`/api/donations/verify/${donation._id}`)
        .set("Cookie", ngoCookie)
        .send(verifyData);

      expect(verifyResponse.status).toBe(200);
      
      if (verifyData.status === "Verified") {
        totalVerified += verifyData.confirmedAmount;
      }
    }

    // Step 5: NGO checks final campaign progress
    const finalCampaignResponse = await agent
      .get(`/api/campaigns/${campaignId}`);

    expect(finalCampaignResponse.status).toBe(200);
    expect(finalCampaignResponse.body.campaign.raisedAmount).toBe(totalVerified);

    // Step 6: NGO completes campaign when target reached
    if (totalVerified >= campaignData.targetAmount) {
      const completeResponse = await agent
        .put(`/api/campaigns/update/${campaignId}`)
        .set("Cookie", ngoCookie)
        .send({ status: "Completed" });

      expect(completeResponse.status).toBe(200);
      expect(completeResponse.body.campaign.status).toBe("Completed");
    }
  });

  it("should handle NGO error scenarios and edge cases", async () => {
    // Test 1: NGO cannot access admin-only endpoints
    const adminOnlyResponse = await agent
      .delete("/api/adminUser/delete-user/someUserId")
      .set("Cookie", ngoCookie);

    expect(adminOnlyResponse.status).toBe(403);

    // Test 2: NGO cannot modify other NGO's campaigns
    // Create another NGO user
    const otherNgoData = {
      name: "Other NGO",
      email: "other@ngo.org",
      password: "password123",
      role: "NGO"
    };

    await agent.post("/api/auth/register").send(otherNgoData);
    await User.findOneAndUpdate(
      { email: otherNgoData.email },
      { isAccountVerified: true }
    );

    const otherNgoLogin = await agent
      .post("/api/auth/login")
      .send({
        email: otherNgoData.email,
        password: otherNgoData.password
      });

    const otherNgoCookie = otherNgoLogin.headers["set-cookie"];

    // First NGO creates campaign
    const campaignData = {
      title: "First NGO Campaign",
      description: "Campaign by first NGO",
      targetAmount: 10000,
      bankDetails: {
        accountName: "Help NGO",
        accountNumber: "1234567890",
        bankName: "Bank of Ceylon",
        branchName: "Colombo Branch"
      }
    };

    const campaignResponse = await agent
      .post("/api/campaigns/create")
      .set("Cookie", ngoCookie)
      .send(campaignData);

    expect(campaignResponse.status).toBe(201);
    const campaignId = campaignResponse.body.campaign._id;

    // Second NGO tries to update first NGO's campaign
    const unauthorizedUpdateResponse = await agent
      .put(`/api/campaigns/update/${campaignId}`)
      .set("Cookie", otherNgoCookie)
      .send({ description: "Unauthorized update" });

    expect(unauthorizedUpdateResponse.status).toBe(403);

    // Test 3: NGO cannot verify donations for other NGO's campaigns
    const donationData = {
      campaignId: campaignId,
      donationType: "Money",
      declaredAmount: 1000,
      donorMessage: "Test donation"
    };

    const donationResponse = await agent
      .post("/api/donations/submit")
      .set("Cookie", citizenCookie)
      .field(donationData)
      .attach("proofImage", Buffer.from("test-proof"), "proof.jpg");

    expect(donationResponse.status).toBe(201);

    const unauthorizedVerifyResponse = await agent
      .put(`/api/donations/verify/${donationResponse.body.donation._id}`)
      .set("Cookie", otherNgoCookie)
      .send({
        confirmedAmount: 1000,
        status: "Verified"
      });

    expect(unauthorizedVerifyResponse.status).toBe(403);
  });
});
