import { jest } from "@jest/globals";
import { startTestServer, stopTestServer, clearDatabase } from "../setup/testEnv.js";
import { resetAllMocks, mockWeatherService } from "../setup/mocks.js";
import User from "../../models/user.js";

describe("Help API Integration", () => {
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

    // Mock weather service to avoid real API calls
    mockWeatherService.default.mockResolvedValue("Clear");

    // Create and login as citizen user
    const userData = {
      name: "Citizen User",
      email: "citizen@example.com",
      password: "password123",
      role: "CITIZEN"
    };

    await agent.post("/api/auth/register").send(userData);
    await User.findOneAndUpdate(
      { email: userData.email },
      { isAccountVerified: true }
    );

    const loginResponse = await agent
      .post("/api/auth/login")
      .send({
        email: userData.email,
        password: userData.password
      });

    authCookie = loginResponse.headers["set-cookie"];
  });

  it("should create a new help request", async () => {
    const helpData = {
      name: "John Doe",
      location: "Colombo, Sri Lanka",
      realLocation: "Colombo, Sri Lanka",
      disasterType: "flood",
      message: "Need immediate help due to flooding",
      contactNumber: "+94123456789"
    };

    const response = await agent
      .post("/api/help/add")
      .set("Cookie", authCookie)
      .send(helpData);

    expect(response.status).toBe(201);
    expect(response.body.name).toBe(helpData.name);
    expect(response.body.disasterType).toBe(helpData.disasterType);
    expect(response.body.urgency).toBeDefined();
    expect(response.body.weatherCondition).toBeDefined();
  });

  it("should get all help requests", async () => {
    // Create multiple help requests
    const helpRequests = [
      {
        name: "Person 1",
        location: "Colombo",
        realLocation: "Colombo",
        disasterType: "flood",
        message: "Need help",
        contactNumber: "+94123456789"
      },
      {
        name: "Person 2",
        location: "Kandy",
        realLocation: "Kandy",
        disasterType: "landslide",
        message: "Trapped",
        contactNumber: "+94123456790"
      }
    ];

    for (const help of helpRequests) {
      await agent
        .post("/api/help/add")
        .set("Cookie", authCookie)
        .send(help);
    }

    const response = await agent.get("/api/help/");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(2);
  });

  it("should get help request by ID", async () => {
    // Create a help request
    const helpData = {
      name: "Test Person",
      location: "Colombo",
      realLocation: "Colombo",
      disasterType: "flood",
      message: "Need help",
      contactNumber: "+94123456789"
    };

    const createResponse = await agent
      .post("/api/help/add")
      .set("Cookie", authCookie)
      .send(helpData);

    const helpId = createResponse.body._id;

    // Get help request by ID
    const response = await agent.get(`/api/help/getid/${helpId}`);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(helpData.name);
    expect(response.body.disasterType).toBe(helpData.disasterType);
  });

  it("should update a help request", async () => {
    // Create a help request first
    const helpData = {
      name: "Test Person",
      location: "Colombo",
      realLocation: "Colombo",
      disasterType: "flood",
      message: "Need help",
      contactNumber: "+94123456789"
    };

    const createResponse = await agent
      .post("/api/help/add")
      .set("Cookie", authCookie)
      .send(helpData);

    const helpId = createResponse.body._id;

    // Update the help request
    const updateData = {
      message: "Updated message - still need help",
      urgency: "high"
    };

    const response = await agent
      .put(`/api/help/update/${helpId}`)
      .set("Cookie", authCookie)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(updateData.message);
    expect(response.body.urgency).toBe(updateData.urgency);
  });

  it("should delete a help request", async () => {
    // Create a help request first
    const helpData = {
      name: "Test Person",
      location: "Colombo",
      realLocation: "Colombo",
      disasterType: "flood",
      message: "Need help",
      contactNumber: "+94123456789"
    };

    const createResponse = await agent
      .post("/api/help/add")
      .set("Cookie", authCookie)
      .send(helpData);

    const helpId = createResponse.body._id;

    // Delete the help request
    const response = await agent
      .delete(`/api/help/delete/${helpId}`)
      .set("Cookie", authCookie);

    expect(response.status).toBe(200);

    // Verify help request is deleted
    const getResponse = await agent.get(`/api/help/getid/${helpId}`);
    expect(getResponse.status).toBe(404);
  });

  it("should handle help request with images", async () => {
    const helpData = {
      name: "Person with images",
      location: "Colombo",
      realLocation: "Colombo",
      disasterType: "flood",
      message: "Need help with images",
      contactNumber: "+94123456789",
      images: [
        {
          data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
          mimeType: "image/png"
        }
      ]
    };

    const response = await agent
      .post("/api/help/add")
      .set("Cookie", authCookie)
      .send(helpData);

    expect(response.status).toBe(201);
    expect(response.body.images).toBeDefined();
    expect(response.body.images).toHaveLength(1);
  });

  it("should handle help request with voice message", async () => {
    const helpData = {
      name: "Person with voice",
      location: "Colombo",
      realLocation: "Colombo",
      disasterType: "flood",
      message: "Need help with voice",
      contactNumber: "+94123456789",
      voiceMessage: {
        data: "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=",
        mimeType: "audio/mpeg"
      }
    };

    const response = await agent
      .post("/api/help/add")
      .set("Cookie", authCookie)
      .send(helpData);

    expect(response.status).toBe(201);
    expect(response.body.voiceMessage).toBeDefined();
  });
});
