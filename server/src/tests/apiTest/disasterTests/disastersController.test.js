import { jest } from "@jest/globals";

/**
 * Helpers
 */
function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

const cacheGetMock = jest.fn();
const cacheSetMock = jest.fn();
const cacheKeyMock = jest.fn((req) => `GET:${req.originalUrl || "/mock"}`);
await jest.unstable_mockModule("../../../lib/cache.js", () => ({
  cache: { get: cacheGetMock, set: cacheSetMock },
  cacheKey: cacheKeyMock,
}));

const parseBBoxMock = jest.fn(() => ({
  minLng: 79.5,
  minLat: 5.7,
  maxLng: 82.1,
  maxLat: 10.0,
}));
await jest.unstable_mockModule("../../../lib/bbox.js", () => ({
  parseBBox: parseBBoxMock,
}));

/**
 * Mock 3rd-party service integrations
 */
const fetchEarthquakesMock = jest.fn();
await jest.unstable_mockModule("../../../services/disasters/usgs.service.js", () => ({
  fetchEarthquakes: fetchEarthquakesMock,
}));

const fetchFireHotspotsMock = jest.fn();
await jest.unstable_mockModule("../../../services/disasters/firms.service.js", () => ({
  fetchFireHotspots: fetchFireHotspotsMock,
}));

const fetchGdacsRssByCodeMock = jest.fn();
await jest.unstable_mockModule("../../../services/disasters/gdacs.service.js", () => ({
  fetchGdacsRssByCode: fetchGdacsRssByCodeMock,
}));

const fetchReliefWebReportsMock = jest.fn();
const fetchReliefWebDisastersMock = jest.fn();
await jest.unstable_mockModule("../../../services/disasters/reliefweb.service.js", () => ({
  fetchReliefWebReports: fetchReliefWebReportsMock,
  fetchReliefWebDisasters: fetchReliefWebDisastersMock,
}));

/**
 * Mock normalizers + helpers
 * Keep these deterministic so tests are stable.
 */
const normalizeUSGSMock = jest.fn((raw) => ({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [79.8612, 6.9271] },
      properties: { source: "USGS", eventType: "EARTHQUAKE", mag: 4.5, raw },
    },
  ],
}));

const normalizeFIRMSMock = jest.fn((raw) => ({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [80.0, 7.0] },
      properties: { source: "FIRMS", eventType: "FIRE", frp: 10, raw },
    },
  ],
}));

const normalizeGDACSMock = jest.fn((raw) => ({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [81.0, 8.0] },
      properties: { source: "GDACS", eventType: "FLOOD", alertLevel: "orange", raw },
    },
  ],
}));

const normalizeReliefWebForListMock = jest.fn((raw) => raw?.data || raw || []);

const toFeatureCollectionMock = jest.fn((features) => ({
  type: "FeatureCollection",
  features,
}));

const featureCollectionToHeatPointsMock = jest.fn((fc, intensityFn) => {
  // Convert each feature into a heat point with a predictable intensity value
  return (fc.features || []).map((f) => {
    const [lng, lat] = f.geometry.coordinates;
    return {
      lat,
      lng,
      intensity: intensityFn ? intensityFn(f) : 0.5,
      type: f.properties.eventType,
      meta: f.properties,
    };
  });
});

await jest.unstable_mockModule("../../../services/disasters/normalize.js", () => ({
  normalizeUSGS: normalizeUSGSMock,
  normalizeGDACS: normalizeGDACSMock,
  normalizeFIRMS: normalizeFIRMSMock,
  normalizeReliefWebForList: normalizeReliefWebForListMock,
  featureCollectionToHeatPoints: featureCollectionToHeatPointsMock,
  toFeatureCollection: toFeatureCollectionMock,
}));

/**
 * Import controller AFTER mocks
 */
const { disastersMap, disastersHeatmap, disasterUpdates } = await import(
  "../../../controllers/disastersController.js"
);

describe("Disasters Controller - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cacheGetMock.mockReturnValue(undefined);
  });

  describe("disastersMap (GET /api/disasters/map)", () => {
    test("should return 400 when start/end missing", async () => {
      const req = { query: { types: "EARTHQUAKE" }, originalUrl: "/api/disasters/map" };
      const res = mockRes();

      await disastersMap(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    test("should return cached response when cache hit", async () => {
      const cachedFC = { type: "FeatureCollection", features: [{ id: "cached" }] };
      cacheGetMock.mockReturnValue(cachedFC);

      const req = {
        query: { start: "2026-02-01", end: "2026-02-10", types: "EARTHQUAKE" },
        originalUrl: "/api/disasters/map?types=EARTHQUAKE",
        method: "GET",
      };
      const res = mockRes();

      await disastersMap(req, res);

      expect(cacheGetMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, source: "cache", data: cachedFC })
      );
    });

    test("EARTHQUAKE: should call USGS service and return FeatureCollection", async () => {
      fetchEarthquakesMock.mockResolvedValue({ usgs: "raw" });

      const req = {
        query: {
          start: "2026-02-01",
          end: "2026-02-10",
          types: "EARTHQUAKE",
          minmag: "2.5",
        },
        originalUrl: "/api/disasters/map?types=EARTHQUAKE",
        method: "GET",
      };
      const res = mockRes();

      await disastersMap(req, res);

      expect(fetchEarthquakesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          start: "2026-02-01",
          end: "2026-02-10",
          minmag: 2.5,
          bbox: expect.any(Object),
        })
      );

      expect(normalizeUSGSMock).toHaveBeenCalled();
      expect(toFeatureCollectionMock).toHaveBeenCalled();

      expect(cacheSetMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ type: "FeatureCollection" }),
        })
      );
    });

    test("FIRE: should call FIRMS service and return FeatureCollection", async () => {
      fetchFireHotspotsMock.mockResolvedValue([{ latitude: "7", longitude: "80", frp: "10" }]);

      const req = {
        query: {
          start: "2026-02-01",
          end: "2026-02-10",
          types: "FIRE",
          days: "3",
        },
        originalUrl: "/api/disasters/map?types=FIRE",
        method: "GET",
      };
      const res = mockRes();

      await disastersMap(req, res);

      expect(fetchFireHotspotsMock).toHaveBeenCalledWith({
        bbox: expect.any(Object),
        days: 3,
        source: "VIIRS_SNPP_NRT",
      });

      expect(normalizeFIRMSMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("FLOOD: should call GDACS service and return FeatureCollection", async () => {
      fetchGdacsRssByCodeMock.mockResolvedValue({ gdacs: "raw" });
      cacheGetMock.mockReturnValue(undefined); // Ensure no cache hit

      const req = {
        query: { start: "2026-02-01", end: "2026-02-10", types: "FLOOD" },
        originalUrl: "/api/disasters/map?types=FLOOD",
        method: "GET",
      };
      const res = mockRes();

      await disastersMap(req, res);

      expect(fetchGdacsRssByCodeMock).toHaveBeenCalledWith({
        gdacsCode: "FL",
        bbox: expect.any(Object),
      });
      expect(toFeatureCollectionMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("should return 500 when service throws", async () => {
      fetchEarthquakesMock.mockRejectedValue(new Error("USGS down"));

      const req = {
        query: { start: "2026-02-01", end: "2026-02-10", types: "EARTHQUAKE" },
        originalUrl: "/api/disasters/map?types=EARTHQUAKE",
        method: "GET",
      };
      const res = mockRes();

      await disastersMap(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.any(String),
          error: expect.any(String),
        })
      );
    });
  });

  describe("disastersHeatmap (GET /api/disasters/heatmap)", () => {
    test("should return 400 when start/end missing", async () => {
      const req = { query: { types: "EARTHQUAKE" }, originalUrl: "/api/disasters/heatmap" };
      const res = mockRes();

      await disastersHeatmap(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return cached response when cache hit", async () => {
      const cached = { points: [{ lat: 6, lng: 80, intensity: 0.5, type: "FIRE" }] };
      cacheGetMock.mockReturnValue(cached);

      const req = {
        query: { start: "2026-02-01", end: "2026-02-10", types: "FIRE" },
        originalUrl: "/api/disasters/heatmap?types=FIRE",
        method: "GET",
      };
      const res = mockRes();

      await disastersHeatmap(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, source: "cache", data: cached })
      );
    });

    test("EARTHQUAKE: should return heatmap points", async () => {
      fetchEarthquakesMock.mockResolvedValue({ usgs: "raw" });

      const req = {
        query: { start: "2026-02-01", end: "2026-02-10", types: "EARTHQUAKE", minmag: "2.5" },
        originalUrl: "/api/disasters/heatmap?types=EARTHQUAKE",
        method: "GET",
      };
      const res = mockRes();

      await disastersHeatmap(req, res);

      expect(featureCollectionToHeatPointsMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            points: expect.any(Array),
          }),
        })
      );
    });

    test("should return 500 when service throws", async () => {
      fetchGdacsRssByCodeMock.mockRejectedValue(new Error("GDACS error"));

      const req = {
        query: { start: "2026-02-01", end: "2026-02-10", types: "FLOOD" },
        originalUrl: "/api/disasters/heatmap?types=FLOOD",
        method: "GET",
      };
      const res = mockRes();

      await disastersHeatmap(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("disasterUpdates (GET /api/disasters/updates)", () => {
    test("should return cached response when cache hit", async () => {
      const cached = { reports: [], disasters: [] };
      cacheGetMock.mockReturnValue(cached);

      const req = {
        query: { q: "Sri Lanka", limit: "10" },
        originalUrl: "/api/disasters/updates?q=Sri%20Lanka&limit=10",
        method: "GET",
      };
      const res = mockRes();

      await disasterUpdates(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, source: "cache", data: cached })
      );
    });

    test("should fetch ReliefWeb reports + disasters and return normalized lists", async () => {
      fetchReliefWebReportsMock.mockResolvedValue({ data: [{ id: 1, title: "R1" }] });
      fetchReliefWebDisastersMock.mockResolvedValue({ data: [{ id: 2, title: "D1" }] });

      const req = {
        query: { q: "Sri Lanka Flood", limit: "10" }, // single q supports combined searching
        originalUrl: "/api/disasters/updates?q=Sri%20Lanka%20Flood&limit=10",
        method: "GET",
      };
      const res = mockRes();

      await disasterUpdates(req, res);

      expect(fetchReliefWebReportsMock).toHaveBeenCalledWith(
        expect.objectContaining({ query: "Sri Lanka Flood", limit: 10 })
      );
      expect(fetchReliefWebDisastersMock).toHaveBeenCalledWith(
        expect.objectContaining({ country: "Sri Lanka Flood", limit: 10 })
      );

      expect(normalizeReliefWebForListMock).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: {
            reports: [{ id: 1, title: "R1" }],
            disasters: [{ id: 2, title: "D1" }],
          },
        })
      );
    });

    test("should return 500 when ReliefWeb call fails", async () => {
      fetchReliefWebReportsMock.mockRejectedValue(new Error("ReliefWeb 403"));

      const req = {
        query: { q: "Sri Lanka", limit: "10" },
        originalUrl: "/api/disasters/updates?q=Sri%20Lanka&limit=10",
        method: "GET",
      };
      const res = mockRes();

      await disasterUpdates(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });
});