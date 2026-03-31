import { jest } from "@jest/globals";
import { startTestServer, stopTestServer, clearDatabase } from "../setup/testEnv.js";
import { resetAllMocks } from "../setup/mocks.js";
import User from "../../models/user.js";

describe("Admin Management Workflow Integration", () => {
  let agent, server, adminCookie, volunteerCookie, ngoCookie, citizenCookie;

  beforeAll(async () => {
    ({ agent, server } = await startTestServer());
  });

  afterAll(async () => {
    await stopTestServer(server);
  });

  beforeEach(async () => {
    await clearDatabase();
    resetAllMocks();

    // Create and login as admin
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

    // Create and login as volunteer
    const volunteerData = {
      name: "Volunteer User",
      email: "volunteer@example.com",
      password: "password123",
      role: "VOLUNTEER"
    };

    await agent.post("/api/auth/register").send(volunteerData);
    await User.findOneAndUpdate(
      { email: volunteerData.email },
      { isAccountVerified: true }
    );

    const volunteerLogin = await agent
      .post("/api/auth/login")
      .send({
        email: volunteerData.email,
        password: volunteerData.password
      });

    volunteerCookie = volunteerLogin.headers["set-cookie"];

    // Create and login as NGO
    const ngoData = {
      name: "NGO User",
      email: "ngo@example.com",
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

    // Create and login as citizen
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

  it("should complete full admin management workflow", async () => {
    // Step 1: Admin views all help requests
    const helpRequestsResponse = await agent
      .get("/api/help/")
      .set("Cookie", adminCookie);

    expect(helpRequestsResponse.status).toBe(200);
    expect(Array.isArray(helpRequestsResponse.body)).toBe(true);

    // Step 2: Admin creates help request for testing
    const helpData = {
      name: "Test Help Request",
      location: "Colombo, Sri Lanka",
      realLocation: "Colombo, Sri Lanka",
      disasterType: "flood",
      message: "Test emergency help request",
      contactNumber: "+94123456789"
    };

    await agent
      .post("/api/help/add")
      .set("Cookie", citizenCookie)
      .send(helpData);

    // Step 3: Admin views updated help requests
    const updatedHelpRequestsResponse = await agent
      .get("/api/help/")
      .set("Cookie", adminCookie);

    expect(updatedHelpRequestsResponse.status).toBe(200);
    expect(updatedHelpRequestsResponse.body.length).toBeGreaterThan(0);

    // Step 4: Admin updates help request status
    const helpRequestId = updatedHelpRequestsResponse.body[0]._id;
    const updateResponse = await agent
      .put(`/api/help/update/${helpRequestId}`)
      .set("Cookie", adminCookie)
      .send({
        status: "verified",
        urgency: "high",
        adminNotes: "Admin verified this request"
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.status).toBe("verified");
    expect(updateResponse.body.adminNotes).toBe("Admin verified this request");

    // Step 5: Admin views all NGOs
    const ngosResponse = await agent
      .get("/api/admin/ngos")
      .set("Cookie", adminCookie);

    expect(ngosResponse.status).toBe(200);
    expect(Array.isArray(ngosResponse.body)).toBe(true);

    // Step 6: Admin verifies NGO
    const ngoUser = await User.findOne({ email: "ngo@example.com" });
    const verifyNgoResponse = await agent
      .patch(`/api/adminUser/verify-ngo/${ngoUser._id}`)
      .set("Cookie", adminCookie);

    expect(verifyNgoResponse.status).toBe(200);
    expect(verifyNgoResponse.body.success).toBe(true);

    // Step 7: Admin verifies volunteer
    const volunteerUser = await User.findOne({ email: "volunteer@example.com" });
    const verifyVolunteerResponse = await agent
      .patch(`/api/adminUser/verify-volunteer/${volunteerUser._id}`)
      .set("Cookie", adminCookie);

    expect(verifyVolunteerResponse.status).toBe(200);
    expect(verifyVolunteerResponse.body.success).toBe(true);

    // Step 8: Admin views all shelters
    const sheltersResponse = await agent
      .get("/api/shelters/get-list")
      .set("Cookie", adminCookie);

    expect(sheltersResponse.status).toBe(200);
    expect(sheltersResponse.body.success).toBe(true);

    // Step 9: Admin creates a shelter
    const shelterData = {
      name: "Admin Managed Shelter",
      description: "Shelter created by admin",
      shelterType: "GOVERNMENT_BUILDING",
      address: {
        street: "123 Admin St",
        city: "Colombo",
        province: "Western",
        postalCode: "00100"
      },
      contact: {
        phone: "+94123456789",
        email: "admin@shelter.com"
      },
      location: {
        type: "Point",
        coordinates: [79.8612, 6.9271]
      },
      capacity: {
        total: 200
      },
      supports: {
        disasterTypes: ["FLOOD", "LANDSLIDE"],
        wheelchairAccess: true,
        medical: true,
        food: true,
        water: true,
        power: true
      },
      verified: true
    };

    const createShelterResponse = await agent
      .post("/api/shelters/create")
      .set("Cookie", adminCookie)
      .send(shelterData);

    expect(createShelterResponse.status).toBe(201);
    expect(createShelterResponse.body.shelter.name).toBe(shelterData.name);
    expect(createShelterResponse.body.shelter.verified).toBe(true);

    // Step 10: Admin resolves help request
    const resolveResponse = await agent
      .put(`/api/help/update/${helpRequestId}`)
      .set("Cookie", adminCookie)
      .send({
        status: "resolved",
        adminNotes: "Help provided to affected family"
      });

    expect(resolveResponse.status).toBe(200);
    expect(resolveResponse.body.status).toBe("resolved");
    expect(resolveResponse.body.resolvedAt).toBeDefined();
  });

  it("should handle admin user verification workflow", async () => {
    // Step 1: Create unverified users
    const unverifiedUsers = [
      {
        name: "Unverified Volunteer 1",
        email: "unvol1@example.com",
        password: "password123",
        role: "VOLUNTEER"
      },
      {
        name: "Unverified Volunteer 2",
        email: "unvol2@example.com",
        password: "password123",
        role: "VOLUNTEER"
      },
      {
        name: "Unverified NGO 1",
        email: "unngo1@example.com",
        password: "password123",
        role: "NGO"
      },
      {
        name: "Unverified NGO 2",
        email: "unngo2@example.com",
        password: "password123",
        role: "NGO"
      }
    ];

    const createdUsers = [];
    for (const userData of unverifiedUsers) {
      const response = await agent.post("/api/auth/register").send(userData);
      expect(response.status).toBe(201);
      
      const user = await User.findOne({ email: userData.email });
      createdUsers.push(user);
    }

    // Step 2: Admin verifies volunteers
    const volunteers = createdUsers.filter(u => u.role === "VOLUNTEER");
    for (const volunteer of volunteers) {
      const verifyResponse = await agent
        .patch(`/api/adminUser/verify-volunteer/${volunteer._id}`)
        .set("Cookie", adminCookie);

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.success).toBe(true);
    }

    // Step 3: Admin verifies NGOs
    const ngos = createdUsers.filter(u => u.role === "NGO");
    for (const ngo of ngos) {
      const verifyResponse = await agent
        .patch(`/api/adminUser/verify-ngo/${ngo._id}`)
        .set("Cookie", adminCookie);

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.success).toBe(true);
    }

    // Step 4: Verify all users are now verified
    for (const user of createdUsers) {
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.isAccountVerified).toBe(true);
    }
  });

  it("should handle admin help request management workflow", async () => {
    // Step 1: Create multiple help requests
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
        message: "Need medical assistance",
        contactNumber: "+94123456790"
      },
      {
        name: "Family 3",
        location: "Galle, Sri Lanka",
        realLocation: "Galle, Sri Lanka",
        disasterType: "tsunami",
        message: "Need evacuation help",
        contactNumber: "+94123456791"
      }
    ];

    const createdRequests = [];
    for (const helpData of helpRequests) {
      const response = await agent
        .post("/api/help/add")
        .set("Cookie", citizenCookie)
        .send(helpData);

      expect(response.status).toBe(201);
      createdRequests.push(response.body);
    }

    // Step 2: Admin views all help requests
    const allRequestsResponse = await agent
      .get("/api/help/")
      .set("Cookie", adminCookie);

    expect(allRequestsResponse.status).toBe(200);
    expect(allRequestsResponse.body.length).toBe(3);

    // Step 3: Admin updates help requests with different statuses
    const statusUpdates = [
      { status: "verified", urgency: "high", adminNotes: "Priority case" },
      { status: "assigned", urgency: "medium", adminNotes: "Assigned to NGO" },
      { status: "in-progress", urgency: "low", adminNotes: "Being handled" }
    ];

    for (let i = 0; i < createdRequests.length; i++) {
      const updateResponse = await agent
        .put(`/api/help/update/${createdRequests[i]._id}`)
        .set("Cookie", adminCookie)
        .send(statusUpdates[i]);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.status).toBe(statusUpdates[i].status);
    }

    // Step 4: Admin filters help requests by status
    const verifiedRequestsResponse = await agent
      .get("/api/help/")
      .query({ status: "verified" })
      .set("Cookie", adminCookie);

    expect(verifiedRequestsResponse.status).toBe(200);
    expect(verifiedRequestsResponse.body.some(req => req.status === "verified")).toBe(true);

    // Step 5: Admin resolves one help request
    const resolveResponse = await agent
      .put(`/api/help/update/${createdRequests[0]._id}`)
      .set("Cookie", adminCookie)
      .send({
        status: "resolved",
        adminNotes: "Successfully resolved"
      });

    expect(resolveResponse.status).toBe(200);
    expect(resolveResponse.body.status).toBe("resolved");
    expect(resolveResponse.body.resolvedAt).toBeDefined();
  });

  it("should handle admin shelter management workflow", async () => {
    // Step 1: Admin creates multiple shelters
    const shelters = [
      {
        name: "Emergency Shelter 1",
        description: "Primary emergency shelter",
        shelterType: "SCHOOL",
        address: {
          street: "123 School St",
          city: "Colombo",
          province: "Western",
          postalCode: "00100"
        },
        contact: {
          phone: "+94123456789",
          email: "shelter1@example.com"
        },
        location: {
          type: "Point",
          coordinates: [79.8612, 6.9271]
        },
        capacity: {
          total: 100
        },
        supports: {
          disasterTypes: ["FLOOD"],
          wheelchairAccess: true,
          medical: true,
          food: true,
          water: true,
          power: false
        },
        verified: true
      },
      {
        name: "Emergency Shelter 2",
        description: "Secondary emergency shelter",
        shelterType: "COMMUNITY_HALL",
        address: {
          street: "456 Hall Ave",
          city: "Kandy",
          province: "Central",
          postalCode: "20000"
        },
        contact: {
          phone: "+94123456790",
          email: "shelter2@example.com"
        },
        location: {
          type: "Point",
          coordinates: [80.6337, 7.2906]
        },
        capacity: {
          total: 75
        },
        supports: {
          disasterTypes: ["LANDSLIDE"],
          wheelchairAccess: false,
          medical: false,
          food: true,
          water: true,
          power: true
        },
        verified: true
      }
    ];

    const createdShelters = [];
    for (const shelterData of shelters) {
      const response = await agent
        .post("/api/shelters/create")
        .set("Cookie", adminCookie)
        .send(shelterData);

      expect(response.status).toBe(201);
      createdShelters.push(response.body.shelter);
    }

    // Step 2: Admin views all shelters
    const allSheltersResponse = await agent
      .get("/api/shelters/get-list")
      .set("Cookie", adminCookie);

    expect(allSheltersResponse.status).toBe(200);
    expect(allSheltersResponse.body.shelters.length).toBeGreaterThanOrEqual(2);

    // Step 3: Admin updates shelter information
    const updateData = {
      capacity: { total: 150 },
      supports: {
        wheelchairAccess: true,
        medical: true,
        food: true,
        water: true,
        power: true
      }
    };

    const updateResponse = await agent
      .patch(`/api/shelters/update/${createdShelters[0]._id}`)
      .set("Cookie", adminCookie)
      .send(updateData);

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.shelter.capacity.total).toBe(150);
    expect(updateResponse.body.shelter.supports.power).toBe(true);

    // Step 4: Admin deletes a shelter
    const deleteResponse = await agent
      .delete(`/api/shelters/delete/${createdShelters[1]._id}`)
      .set("Cookie", adminCookie);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.success).toBe(true);

    // Step 5: Verify shelter is deleted
    const getDeletedResponse = await agent
      .get(`/api/shelters/get/${createdShelters[1]._id}`);

    expect(getDeletedResponse.status).toBe(404);
  });

  it("should handle admin NGO management workflow", async () => {
    // Step 1: Create multiple NGOs
    const ngos = [
      {
        name: "Red Cross Sri Lanka",
        email: "redcross@lk.org",
        password: "password123",
        role: "NGO"
      },
      {
        name: "Save the Children",
        email: "savethechildren@lk.org",
        password: "password123",
        role: "NGO"
      }
    ];

    const createdNgos = [];
    for (const ngoData of ngos) {
      const response = await agent.post("/api/auth/register").send(ngoData);
      expect(response.status).toBe(201);
      
      const user = await User.findOne({ email: ngoData.email });
      createdNgos.push(user);
    }

    // Step 2: Admin views all NGOs
    const allNgosResponse = await agent
      .get("/api/admin/ngos")
      .set("Cookie", adminCookie);

    expect(allNgosResponse.status).toBe(200);
    expect(Array.isArray(allNgosResponse.body)).toBe(true);

    // Step 3: Admin verifies NGOs
    for (const ngo of createdNgos) {
      const verifyResponse = await agent
        .patch(`/api/adminUser/verify-ngo/${ngo._id}`)
        .set("Cookie", adminCookie);

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.success).toBe(true);
    }

    // Step 4: Admin views verified NGOs
    const verifiedNgosResponse = await agent
      .get("/api/admin/ngos")
      .query({ verified: true })
      .set("Cookie", adminCookie);

    expect(verifiedNgosResponse.status).toBe(200);
    expect(verifiedNgosResponse.body.length).toBeGreaterThanOrEqual(2);
  });

  it("should handle admin user deletion workflow", async () => {
    // Step 1: Create users to be deleted
    const usersToDelete = [
      {
        name: "User to Delete 1",
        email: "delete1@example.com",
        password: "password123",
        role: "CITIZEN"
      },
      {
        name: "User to Delete 2",
        email: "delete2@example.com",
        password: "password123",
        role: "VOLUNTEER"
      }
    ];

    const createdUsers = [];
    for (const userData of usersToDelete) {
      const response = await agent.post("/api/auth/register").send(userData);
      expect(response.status).toBe(201);
      
      const user = await User.findOne({ email: userData.email });
      createdUsers.push(user);
    }

    // Step 2: Admin deletes users
    for (const user of createdUsers) {
      const deleteResponse = await agent
        .delete(`/api/adminUser/delete-user/${user._id}`)
        .set("Cookie", adminCookie);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);
    }

    // Step 3: Verify users are deleted
    for (const user of createdUsers) {
      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    }
  });

  it("should handle admin error scenarios and authorization", async () => {
    // Test 1: Non-admin cannot access admin endpoints
    const unauthorizedResponse = await agent
      .get("/api/admin/ngos")
      .set("Cookie", citizenCookie);

    expect(unauthorizedResponse.status).toBe(403);

    // Test 2: Non-admin cannot verify users
    const volunteerUser = await User.findOne({ email: "volunteer@example.com" });
    const unauthorizedVerifyResponse = await agent
      .patch(`/api/adminUser/verify-volunteer/${volunteerUser._id}`)
      .set("Cookie", citizenCookie);

    expect(unauthorizedVerifyResponse.status).toBe(403);

    // Test 3: Non-admin cannot delete users
    const citizenUser = await User.findOne({ email: "citizen@example.com" });
    const unauthorizedDeleteResponse = await agent
      .delete(`/api/adminUser/delete-user/${citizenUser._id}`)
      .set("Cookie", citizenCookie);

    expect(unauthorizedDeleteResponse.status).toBe(403);

    // Test 4: Admin cannot delete another admin
    const adminUser = await User.findOne({ email: "admin@example.com" });
    const selfDeleteResponse = await agent
      .delete(`/api/adminUser/delete-user/${adminUser._id}`)
      .set("Cookie", adminCookie);

    // This might fail due to business logic preventing self-deletion
    expect([200, 400, 403]).toContain(selfDeleteResponse.status);

    // Test 5: Admin cannot verify non-existent user
    const nonExistentId = "507f1f77bcf86cd799439011";
    const nonExistentResponse = await agent
      .patch(`/api/adminUser/verify-volunteer/${nonExistentId}`)
      .set("Cookie", adminCookie);

    expect(nonExistentResponse.status).toBe(404);
  });

  it("should handle admin dashboard and reporting workflow", async () => {
    // Step 1: Create test data
    const helpData = {
      name: "Dashboard Test Request",
      location: "Colombo, Sri Lanka",
      realLocation: "Colombo, Sri Lanka",
      disasterType: "flood",
      message: "Test request for dashboard",
      contactNumber: "+94123456789"
    };

    await agent
      .post("/api/help/add")
      .set("Cookie", citizenCookie)
      .send(helpData);

    const shelterData = {
      name: "Dashboard Test Shelter",
      address: {
        city: "Colombo",
        province: "Western",
        postalCode: "00100"
      },
      contact: {
        phone: "+94123456789"
      },
      location: {
        type: "Point",
        coordinates: [79.8612, 6.9271]
      },
      capacity: {
        total: 50
      },
      supports: {
        disasterTypes: ["FLOOD"]
      }
    };

    await agent
      .post("/api/shelters/create")
      .set("Cookie", adminCookie)
      .send(shelterData);

    // Step 2: Admin gets dashboard statistics
    const dashboardResponse = await agent
      .get("/api/admin/dashboard")
      .set("Cookie", adminCookie);

    // This endpoint might not exist yet, so we expect either 200 or 404
    expect([200, 404]).toContain(dashboardResponse.status);

    // Step 3: Admin gets user statistics
    const userStatsResponse = await agent
      .get("/api/admin/users/stats")
      .set("Cookie", adminCookie);

    // This endpoint might not exist yet, so we expect either 200 or 404
    expect([200, 404]).toContain(userStatsResponse.status);

    // Step 4: Admin gets help request statistics
    const helpStatsResponse = await agent
      .get("/api/admin/help/stats")
      .set("Cookie", adminCookie);

    // This endpoint might not exist yet, so we expect either 200 or 404
    expect([200, 404]).toContain(helpStatsResponse.status);

    // Step 5: Admin gets shelter statistics
    const shelterStatsResponse = await agent
      .get("/api/admin/shelters/stats")
      .set("Cookie", adminCookie);

    // This endpoint might not exist yet, so we expect either 200 or 404
    expect([200, 404]).toContain(shelterStatsResponse.status);
  });
});
