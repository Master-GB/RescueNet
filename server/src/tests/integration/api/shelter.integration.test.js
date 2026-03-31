import { jest } from "@jest/globals";
import { startTestServer, stopTestServer, clearDatabase } from "../setup/testEnv.js";
import { resetAllMocks } from "../setup/mocks.js";
import User from "../../models/user.js";

describe("Shelter API Integration", () => {
  let agent, server, authCookie;

  beforeAll(async () => {
    ({ agent, server } = await startTestServer());
  });

  afterAll(async () => {
    await stopTestServer(server);
  });

  beforeEach(async () => {
    await clearDatabase();
    resetAllMocks();

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

    const loginResponse = await agent
      .post("/api/auth/login")
      .send({
        email: adminData.email,
        password: adminData.password
      });

    authCookie = loginResponse.headers["set-cookie"];
  });

  it("should create a new shelter", async () => {
    const shelterData = {
      name: "Emergency Shelter",
      description: "Temporary emergency shelter",
      shelterType: "SCHOOL",
      address: {
        street: "123 Main St",
        city: "Colombo",
        province: "Western",
        postalCode: "00100"
      },
      contact: {
        phone: "+94112345678",
        email: "shelter@example.com"
      },
      location: {
        type: "Point",
        coordinates: [79.8612, 6.9271] // [lng, lat]
      },
      capacity: {
        total: 100
      },
      supports: {
        disasterTypes: ["FLOOD", "LANDSLIDE"],
        wheelchairAccess: true,
        medical: true,
        food: true,
        water: true,
        power: false
      },
      specialSupport: {
        elderlySupport: true,
        disabilitySupport: true,
        pregnancySupport: false,
        petFriendly: false,
        childFriendly: true
      }
    };

    const response = await agent
      .post("/api/shelters/create")
      .set("Cookie", authCookie)
      .send(shelterData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.shelter.name).toBe(shelterData.name);
    expect(response.body.shelter.capacity.total).toBe(shelterData.capacity.total);
  });

  it("should get shelter by ID", async () => {
    // First create a shelter
    const shelterData = {
      name: "Test Shelter",
      address: {
        city: "Colombo",
        province: "Western",
        postalCode: "00100"
      },
      contact: {
        phone: "+94112345678"
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

    const createResponse = await agent
      .post("/api/shelters/create")
      .set("Cookie", authCookie)
      .send(shelterData);

    const shelterId = createResponse.body.shelter._id;

    // Get shelter by ID
    const response = await agent.get(`/api/shelters/get/${shelterId}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.shelter.name).toBe(shelterData.name);
  });

  it("should list all shelters", async () => {
    // Create multiple shelters
    const shelters = [
      {
        name: "Shelter 1",
        address: { city: "Colombo", province: "Western", postalCode: "00100" },
        contact: { phone: "+94112345678" },
        location: { type: "Point", coordinates: [79.8612, 6.9271] },
        capacity: { total: 50 },
        supports: { disasterTypes: ["FLOOD"] }
      },
      {
        name: "Shelter 2",
        address: { city: "Kandy", province: "Central", postalCode: "20000" },
        contact: { phone: "+94112345679" },
        location: { type: "Point", coordinates: [80.6337, 7.2906] },
        capacity: { total: 75 },
        supports: { disasterTypes: ["LANDSLIDE"] }
      }
    ];

    for (const shelter of shelters) {
      await agent
        .post("/api/shelters/create")
        .set("Cookie", authCookie)
        .send(shelter);
    }

    const response = await agent.get("/api/shelters/get-list");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.shelters).toHaveLength(2);
  });

  it("should get nearby shelters", async () => {
    // Create a shelter at specific location
    const shelterData = {
      name: "Colombo Shelter",
      address: {
        city: "Colombo",
        province: "Western",
        postalCode: "00100"
      },
      contact: {
        phone: "+94112345678"
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
      .set("Cookie", authCookie)
      .send(shelterData);

    // Search for nearby shelters
    const response = await agent
      .get("/api/shelters/get-nearby")
      .query({
        lng: 79.8612,
        lat: 6.9271,
        radius: 10 // 10km radius
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.shelters).toHaveLength(1);
    expect(response.body.shelters[0].name).toBe(shelterData.name);
  });

  it("should update a shelter", async () => {
    // Create a shelter first
    const shelterData = {
      name: "Original Shelter",
      address: {
        city: "Colombo",
        province: "Western",
        postalCode: "00100"
      },
      contact: {
        phone: "+94112345678"
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

    const createResponse = await agent
      .post("/api/shelters/create")
      .set("Cookie", authCookie)
      .send(shelterData);

    const shelterId = createResponse.body.shelter._id;

    // Update the shelter
    const updateData = {
      name: "Updated Shelter",
      capacity: {
        total: 75
      }
    };

    const response = await agent
      .patch(`/api/shelters/update/${shelterId}`)
      .set("Cookie", authCookie)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.shelter.name).toBe(updateData.name);
    expect(response.body.shelter.capacity.total).toBe(updateData.capacity.total);
  });

  it("should delete a shelter", async () => {
    // Create a shelter first
    const shelterData = {
      name: "Shelter to Delete",
      address: {
        city: "Colombo",
        province: "Western",
        postalCode: "00100"
      },
      contact: {
        phone: "+94112345678"
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

    const createResponse = await agent
      .post("/api/shelters/create")
      .set("Cookie", authCookie)
      .send(shelterData);

    const shelterId = createResponse.body.shelter._id;

    // Delete the shelter
    const response = await agent
      .delete(`/api/shelters/delete/${shelterId}`)
      .set("Cookie", authCookie);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify shelter is deleted
    const getResponse = await agent.get(`/api/shelters/get/${shelterId}`);
    expect(getResponse.status).toBe(404);
  });
});
