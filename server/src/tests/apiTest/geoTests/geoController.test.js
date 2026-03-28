import { jest } from "@jest/globals";

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

const geocodeSvcMock = jest.fn();
const reverseSvcMock = jest.fn();
const getRouteSvcMock = jest.fn();

await jest.unstable_mockModule("../../../services/geo/nominatimService.js", () => ({
  geocode: geocodeSvcMock,
  reverseGeocode: reverseSvcMock,
}));

await jest.unstable_mockModule("../../../services/geo/osrmService.js", () => ({
  getRoute: getRouteSvcMock,
}));

// import controller AFTER mocks
const { geocodeAddress, reverseAddress, route } = await import(
  "../../../controllers/geoController.js"
);

// Alias functions to match test expectations
const geocode = geocodeAddress;
const reverseGeocode = reverseAddress;

describe("Geo Controller - Unit Tests", () => {
  let cache;
  
  beforeAll(async () => {
    const cacheModule = await import("../../../lib/cache.js");
    cache = cacheModule.cache;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear cache to prevent interference between tests
    if (cache) cache.flushAll();
  });

  // ------------------ GEOCODE ------------------
  describe("geocode", () => {
    test("should return 400 if q missing", async () => {
      const req = { query: {} };
      const res = mockRes();

      await geocode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(geocodeSvcMock).not.toHaveBeenCalled();
    });

    test("should return 200 with geocode results", async () => {
      geocodeSvcMock.mockResolvedValue([{ lat: "6.9", lon: "79.8" }]);

      const req = { query: { q: "Colombo", limit: "5" } };
      const res = mockRes();

      await geocode(req, res);

      expect(geocodeSvcMock).toHaveBeenCalledWith({ q: "Colombo", limit: 5 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    test("should return 500 when geocode service throws", async () => {
      geocodeSvcMock.mockRejectedValue(new Error("Nominatim failed"));

      const req = { query: { q: "Colombo" } };
      const res = mockRes();

      await geocode(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });

  // ------------------ REVERSE ------------------
  describe("reverseGeocode", () => {
    test("should return 400 when lat/lng missing", async () => {
      const req = { query: { lat: "6.9" } }; // missing lng
      const res = mockRes();

      await reverseGeocode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(reverseSvcMock).not.toHaveBeenCalled();
    });

    test("should return 400 when lat/lng not numbers", async () => {
      const req = { query: { lat: "abc", lng: "79.8" } };
      const res = mockRes();

      await reverseGeocode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(reverseSvcMock).not.toHaveBeenCalled();
    });

    test("should return 200 with reverse result", async () => {
      reverseSvcMock.mockResolvedValue({ display_name: "Colombo" });

      const req = { query: { lat: "6.9271", lng: "79.8612", zoom: "18" } };
      const res = mockRes();

      await reverseGeocode(req, res);

      expect(reverseSvcMock).toHaveBeenCalledWith({ lat: 6.9271, lng: 79.8612 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    test("should return 500 when reverse service throws", async () => {
      reverseSvcMock.mockRejectedValue(new Error("Reverse failed"));

      const req = { query: { lat: "6.9271", lng: "79.8612" } };
      const res = mockRes();

      await reverseGeocode(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });

  // ------------------ ROUTE ------------------
  describe("route", () => {
    test("should return 400 when required params missing", async () => {
      const req = { query: { fromLng: "79.8", fromLat: "6.9" } };
      const res = mockRes();

      await route(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(getRouteSvcMock).not.toHaveBeenCalled();
    });

    test("should return 400 when coords invalid numbers", async () => {
      const req = {
        query: { fromLng: "abc", fromLat: "6.9", toLng: "80.6", toLat: "7.2" },
      };
      const res = mockRes();

      await route(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(getRouteSvcMock).not.toHaveBeenCalled();
    });

    test("should return 200 with route data", async () => {
      getRouteSvcMock.mockResolvedValue({
        code: "Ok",
        routes: [{ distance: 1000, duration: 600 }],
      });

      const req = {
        query: {
          fromLng: "79.8612",
          fromLat: "6.9271",
          toLng: "80.6337",
          toLat: "7.2906",
          profile: "driving",
          alternatives: "true",
          overview: "full",
          geometries: "geojson",
        },
      };
      const res = mockRes();

      await route(req, res);

      expect(getRouteSvcMock).toHaveBeenCalledWith({
        profile: "driving",
        from: [79.8612, 6.9271],
        to: [80.6337, 7.2906],
        alternatives: true,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    test("should return 500 when route service throws", async () => {
      getRouteSvcMock.mockRejectedValue(new Error("OSRM down"));

      const req = {
        query: {
          fromLng: "79.8612",
          fromLat: "6.9271",
          toLng: "80.6337",
          toLat: "7.2906",
        },
      };
      const res = mockRes();

      await route(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });
});
