import { jest } from "@jest/globals";
import { startTestServer, stopTestServer, clearDatabase } from "../setup/testEnv.js";
import { resetAllMocks, mockHttpClient } from "../setup/mocks.js";

describe("Geo API Integration", () => {
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

  describe("Geocoding", () => {
    it("should geocode an address successfully", async () => {
      // Mock Nominatim response
      mockHttpClient.get.mockResolvedValue({
        data: [
          {
            lat: "6.9271",
            lon: "79.8612",
            display_name: "Colombo, Western Province, Sri Lanka"
          }
        ]
      });

      const response = await agent
        .get("/api/geo/geocode")
        .query({ q: "Colombo, Sri Lanka" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].lat).toBe("6.9271");
      expect(response.body.data[0].lon).toBe("79.8612");
    });

    it("should return 400 when query parameter is missing", async () => {
      const response = await agent.get("/api/geo/geocode");

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("query parameter");
    });

    it("should handle geocoding service errors", async () => {
      mockHttpClient.get.mockRejectedValue(new Error("Service unavailable"));

      const response = await agent
        .get("/api/geo/geocode")
        .query({ q: "Invalid Address" });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe("Reverse Geocoding", () => {
    it("should reverse geocode coordinates successfully", async () => {
      // Mock Nominatim reverse response
      mockHttpClient.get.mockResolvedValue({
        data: {
          display_name: "Colombo, Western Province, Sri Lanka",
          address: {
            city: "Colombo",
            country: "Sri Lanka"
          }
        }
      });

      const response = await agent
        .get("/api/geo/reverse")
        .query({ lat: "6.9271", lng: "79.8612" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.display_name).toContain("Colombo");
    });

    it("should return 400 when coordinates are missing", async () => {
      const response = await agent
        .get("/api/geo/reverse")
        .query({ lat: "6.9271" }); // missing lng

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 when coordinates are invalid", async () => {
      const response = await agent
        .get("/api/geo/reverse")
        .query({ lat: "invalid", lng: "79.8612" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("Routing", () => {
    it("should get route between two points successfully", async () => {
      // Mock OSRM response
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

      const response = await agent
        .get("/api/geo/route")
        .query({
          fromLng: "79.8612",
          fromLat: "6.9271",
          toLng: "80.6337",
          toLat: "7.2906",
          profile: "driving"
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.code).toBe("Ok");
      expect(response.body.data.routes).toHaveLength(1);
    });

    it("should return 400 when required parameters are missing", async () => {
      const response = await agent
        .get("/api/geo/route")
        .query({
          fromLng: "79.8612",
          fromLat: "6.9271"
          // missing toLng, toLat
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 when coordinates are invalid", async () => {
      const response = await agent
        .get("/api/geo/route")
        .query({
          fromLng: "invalid",
          fromLat: "6.9271",
          toLng: "80.6337",
          toLat: "7.2906"
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should handle routing service errors", async () => {
      mockHttpClient.get.mockRejectedValue(new Error("Routing service unavailable"));

      const response = await agent
        .get("/api/geo/route")
        .query({
          fromLng: "79.8612",
          fromLat: "6.9271",
          toLng: "80.6337",
          toLat: "7.2906"
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe("Rate Limiting", () => {
    it("should handle rate limiting for geo endpoints", async () => {
      // Mock service to return rate limit error
      mockHttpClient.get.mockRejectedValue({
        response: { status: 429 },
        message: "Too Many Requests"
      });

      const response = await agent
        .get("/api/geo/geocode")
        .query({ q: "Test Address" });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});
