import { jest } from "@jest/globals";
import { startTestServer, stopTestServer, clearDatabase } from "../setup/testEnv.js";
import { resetAllMocks, mockHttpClient, mockWeatherService } from "../setup/mocks.js";
import User from "../../models/user.js";

describe("Emergency Response Workflow Integration", () => {
  let agent, server, citizenCookie, adminCookie, volunteerCookie;

  beforeAll(async () => {
    ({ agent, server } = await startTestServer());
  });

  afterAll(async () => {
    await stopTestServer(server);
  });

  beforeEach(async () => {
    await clearDatabase();
    resetAllMocks();

    // Mock weather service
    mockWeatherService.default.mockResolvedValue("Clear");

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
  });

  it("should complete full emergency response workflow", async () => {
    // Step 1: Citizen creates emergency help request
    const helpRequestData = {
      name: "John Doe",
      location: "Colombo, Sri Lanka",
      realLocation: "Colombo, Sri Lanka",
      disasterType: "flood",
      message: "Need immediate help due to flooding",
      contactNumber: "+94123456789"
    };

    const helpResponse = await agent
      .post("/api/help/add")
      .set("Cookie", citizenCookie)
      .send(helpRequestData);

    expect(helpResponse.status).toBe(201);
    expect(helpResponse.body.name).toBe(helpRequestData.name);
    expect(helpResponse.body.status).toBe("pending");

    const helpRequestId = helpResponse.body._id;

    // Step 2: Admin views all help requests
    const adminListResponse = await agent
      .get("/api/help/")
      .set("Cookie", adminCookie);

    expect(adminListResponse.status).toBe(200);
    expect(adminListResponse.body).toHaveLength(1);
    expect(adminListResponse.body[0]._id).toBe(helpRequestId);

    // Step 3: Admin gets specific help request details
    const adminDetailResponse = await agent
      .get(`/api/help/getid/${helpRequestId}`)
      .set("Cookie", adminCookie);

    expect(adminDetailResponse.status).toBe(200);
    expect(adminDetailResponse.body.name).toBe(helpRequestData.name);

    // Step 4: Admin updates help request status
    const updateResponse = await agent
      .put(`/api/help/update/${helpRequestId}`)
      .set("Cookie", adminCookie)
      .send({
        status: "verified",
        urgency: "high"
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.status).toBe("verified");
    expect(updateResponse.body.urgency).toBe("high");

    // Step 5: Volunteer creates a shelter for affected people
    const shelterData = {
      name: "Emergency Flood Shelter",
      description: "Temporary shelter for flood victims",
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
      }
    };

    const shelterResponse = await agent
      .post("/api/shelters/create")
      .set("Cookie", volunteerCookie)
      .send(shelterData);

    expect(shelterResponse.status).toBe(201);
    expect(shelterResponse.body.shelter.name).toBe(shelterData.name);

    const shelterId = shelterResponse.body.shelter._id;

    // Step 6: Citizen gets nearby shelters
    const nearbySheltersResponse = await agent
      .get("/api/shelters/get-nearby")
      .query({
        lng: 79.8612,
        lat: 6.9271,
        radius: 10
      });

    expect(nearbySheltersResponse.status).toBe(200);
    expect(nearbySheltersResponse.body.shelters).toHaveLength(1);
    expect(nearbySheltersResponse.body.shelters[0].name).toBe(shelterData.name);

    // Step 7: Admin gets disaster information
    mockHttpClient.get.mockResolvedValue({
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [79.8612, 6.9271]
            },
            properties: {
              mag: 3.5,
              place: "Colombo, Sri Lanka"
            }
          }
        ]
      }
    });

    const disasterResponse = await agent
      .get("/api/disasters/map")
      .set("Cookie", adminCookie)
      .query({
        types: "EARTHQUAKE",
        start: "2024-01-01",
        end: "2024-12-31",
        bbox: "79.0,6.0,81.0,8.0"
      });

    expect(disasterResponse.status).toBe(200);
    expect(disasterResponse.body.success).toBe(true);

    // Step 8: Citizen gets weather information
    mockHttpClient.get
      .mockResolvedValueOnce({
        data: {
          results: [
            {
              name: "Colombo",
              country: "Sri Lanka",
              latitude: 6.9271,
              longitude: 79.8612
            }
          ]
        }
      })
      .mockResolvedValueOnce({
        data: {
          current: {
            temperature_2m: 28,
            weather_code: 63,
            wind_speed_10m: 15
          }
        }
      });

    const weatherResponse = await agent
      .get("/api/weather/current")
      .query({ city: "Colombo" });

    expect(weatherResponse.status).toBe(200);
    expect(weatherResponse.body.current.condition).toBe("Moderate rain");

    // Step 9: Admin resolves the help request
    const resolveResponse = await agent
      .put(`/api/help/update/${helpRequestId}`)
      .set("Cookie", adminCookie)
      .send({
        status: "resolved",
        adminNotes: "Victims moved to emergency shelter"
      });

    expect(resolveResponse.status).toBe(200);
    expect(resolveResponse.body.status).toBe("resolved");
    expect(resolveResponse.body.adminNotes).toBe("Victims moved to emergency shelter");

    // Step 10: Verify workflow completion
    const finalHelpResponse = await agent
      .get(`/api/help/getid/${helpRequestId}`)
      .set("Cookie", adminCookie);

    expect(finalHelpResponse.status).toBe(200);
    expect(finalHelpResponse.body.status).toBe("resolved");
    expect(finalHelpResponse.body.resolvedAt).toBeDefined();
  });

  it("should handle workflow with geolocation services", async () => {
    // Mock geocoding service
    mockHttpClient.get.mockResolvedValue({
      data: [
        {
          lat: "6.9271",
          lon: "79.8612",
          display_name: "Colombo, Western Province, Sri Lanka"
        }
      ]
    });

    // Citizen gets geocoding information
    const geoResponse = await agent
      .get("/api/geo/geocode")
      .query({ q: "Colombo, Sri Lanka" });

    expect(geoResponse.status).toBe(200);
    expect(geoResponse.body.success).toBe(true);
    expect(geoResponse.body.data).toHaveLength(1);

    // Mock routing service
    mockHttpClient.get.mockResolvedValue({
      data: {
        code: "Ok",
        routes: [
          {
            geometry: {
              coordinates: [[79.8612, 6.9271], [79.8613, 6.9272]]
            },
            distance: 100,
            duration: 60
          }
        ]
      }
    });

    // Get routing information to shelter
    const routeResponse = await agent
      .get("/api/geo/route")
      .query({
        fromLng: "79.8612",
        fromLat: "6.9271",
        toLng: "79.8613",
        toLat: "6.9272",
        profile: "driving"
      });

    expect(routeResponse.status).toBe(200);
    expect(routeResponse.body.success).toBe(true);
    expect(routeResponse.body.data.routes).toHaveLength(1);
  });

  it("should handle workflow errors gracefully", async () => {
    // Test with invalid help request data
    const invalidHelpData = {
      name: "",
      location: "",
      disasterType: "invalid",
      message: "",
      contactNumber: ""
    };

    const response = await agent
      .post("/api/help/add")
      .set("Cookie", citizenCookie)
      .send(invalidHelpData);

    expect(response.status).toBe(500);

    // Test with unauthorized access
    const unauthorizedResponse = await agent
      .post("/api/shelters/create")
      .send({
        name: "Test Shelter",
        address: { city: "Test", province: "Test", postalCode: "12345" },
        contact: { phone: "+94123456789" },
        location: { type: "Point", coordinates: [0, 0] },
        capacity: { total: 10 },
        supports: { disasterTypes: ["FLOOD"] }
      });

    expect(unauthorizedResponse.status).toBe(401);
  });
});
