import { jest } from "@jest/globals";

// Mock Res function
function makeRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

// Mocks for Location model methods
const createMock = jest.fn();
const findOneMock = jest.fn();
const findOneAndUpdateMock = jest.fn();
const findMock = jest.fn();
const findNearbyEmergenciesMock = jest.fn();
const findNearbyActiveMock = jest.fn();

// IMPORTANT: mock modules BEFORE importing controller
await jest.unstable_mockModule("../../../models/Location.js", () => ({
  default: {
    create: createMock,
    findOne: findOneMock,
    findOneAndUpdate: findOneAndUpdateMock,
    find: findMock,
    findNearbyEmergencies: findNearbyEmergenciesMock,
    findNearbyActive: findNearbyActiveMock,
  },
}));

// Import controller AFTER mocks
const {
  startSharing,
  updateLocation,
  stopSharing,
  getLocation,
  getLocationHistory,
  getActiveSessions,
  activateEmergency,
  markSafe,
  findNearby,
  findNearbyEmergencies,
} = await import("../../../controllers/locationController.js");

describe("Location Controller - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("startSharing", () => {
    test("should return 400 if lat/lng missing", async () => {
      const req = { body: {} };
      const res = makeRes();
      await startSharing(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return 201 and start sharing", async () => {
      const req = {
        body: {
          latitude: 6.9271,
          longitude: 79.8612,
          userName: "Test User",
        },
      };
      const res = makeRes();
      const mockLocation = {
        toObject: () => ({ sessionId: "s1", userName: "Test User", currentLocation: { coordinates: [79.8612, 6.9271] } }),
        currentLocation: { coordinates: [79.8612, 6.9271] }
      };
      createMock.mockResolvedValue(mockLocation);

      await startSharing(req, res);

      expect(createMock).toHaveBeenCalledWith(expect.objectContaining({
        userName: "Test User",
        currentLocation: expect.objectContaining({
          type: "Point",
          coordinates: [79.8612, 6.9271]
        })
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        sessionId: expect.any(String)
      }));
    });
  });

  describe("updateLocation", () => {
    test("should update location using instance method", async () => {
      const req = {
        params: { sessionId: "s1" },
        body: { latitude: 6.9272, longitude: 79.8613 }
      };
      const res = makeRes();
      const mockLocationInstance = {
        addLocationPoint: jest.fn().mockResolvedValue(true),
        currentLocation: { coordinates: [79.8613, 6.9272] }
      };
      findOneMock.mockResolvedValue(mockLocationInstance);

      await updateLocation(req, res);

      expect(mockLocationInstance.addLocationPoint).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test("should return 404 if session not found", async () => {
      const req = { params: { sessionId: "s1" }, body: { latitude: 6, longitude: 79 } };
      const res = makeRes();
      findOneMock.mockResolvedValue(null);
      await updateLocation(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("stopSharing", () => {
    test("should stop sharing using findOneAndUpdate", async () => {
      const req = { params: { sessionId: "s1" } };
      const res = makeRes();
      findOneAndUpdateMock.mockResolvedValue({ sessionId: "s1", isSharing: false });

      await stopSharing(req, res);

      expect(findOneAndUpdateMock).toHaveBeenCalledWith(
        { sessionId: "s1" },
        { isSharing: false, isOnline: false },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  describe("getLocation", () => {
    test("should return location and current status", async () => {
      const req = { params: { sessionId: "s1" } };
      const res = makeRes();
      const mockLocation = {
        sessionId: "s1",
        lastSignalAt: new Date(),
        isOnline: true,
        isSharing: true,
        save: jest.fn().mockResolvedValue(true)
      };
      findOneMock.mockResolvedValue(mockLocation);

      await getLocation(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        isLive: true
      }));
    });
  });

  describe("getActiveSessions", () => {
    test("should return active sessions", async () => {
      const req = { query: {} };
      const res = makeRes();
      const mockSessions = [
        { toObject: () => ({ sessionId: "s1", lastSignalAt: new Date() }), lastSignalAt: new Date() }
      ];
      findMock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockSessions)
      });

      await getActiveSessions(req, res);

      expect(findMock).toHaveBeenCalledWith({ isSharing: true });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        count: 1
      }));
    });
  });

  describe("activateEmergency / markSafe", () => {
    test("should activate emergency", async () => {
      const req = { params: { sessionId: "s1" }, body: { emergencyType: "flood" } };
      const res = makeRes();
      findOneAndUpdateMock.mockResolvedValue({ isEmergency: true });

      await activateEmergency(req, res);

      expect(findOneAndUpdateMock).toHaveBeenCalledWith(
        { sessionId: "s1" },
        expect.objectContaining({ isEmergency: true, emergencyType: "flood" }),
        { new: true }
      );
    });

    test("should mark user safe", async () => {
      const req = { params: { sessionId: "s1" } };
      const res = makeRes();
      findOneAndUpdateMock.mockResolvedValue({ isEmergency: false });

      await markSafe(req, res);

      expect(findOneAndUpdateMock).toHaveBeenCalledWith(
        { sessionId: "s1" },
        { isEmergency: false },
        { new: true }
      );
    });
  });

  describe("findNearby", () => {
    test("should return nearby locations", async () => {
      const req = { query: { latitude: 6.9, longitude: 79.8 } };
      const res = makeRes();
      const mockResult = [{ 
        toObject: () => ({ sessionId: "s1", currentLocation: { coordinates: [79.8, 6.9] } }),
        currentLocation: { coordinates: [79.8, 6.9] }
      }];
      findNearbyActiveMock.mockResolvedValue(mockResult);

      await findNearby(req, res);

      expect(findNearbyActiveMock).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });
});
