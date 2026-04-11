import { jest } from "@jest/globals";

/**
 * Express res mock
 */
function makeRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

/**
 * Mocks for Shelter model functions
 */
const createMock = jest.fn();
const findByIdMock = jest.fn();
const findMock = jest.fn();
const countDocumentsMock = jest.fn();
const findByIdAndUpdateMock = jest.fn();
const findByIdAndDeleteMock = jest.fn();

/**
 * Mock for buildShelterQuery service
 */
const buildShelterQueryMock = jest.fn();

/**
 * IMPORTANT: mock modules BEFORE importing controller
 * Adjust these paths if your structure differs.
 */
await jest.unstable_mockModule("../../../models/shelterModel.js", () => ({
  default: {
    create: createMock,
    findById: findByIdMock,
    find: findMock,
    countDocuments: countDocumentsMock,
    findByIdAndUpdate: findByIdAndUpdateMock,
    findByIdAndDelete: findByIdAndDeleteMock,
  },
}));

await jest.unstable_mockModule("../../../services/shelterQuery.js", () => ({
  buildShelterQuery: buildShelterQueryMock,
}));

/**
 * Import controller AFTER mocks
 */
const {
  createShelter,
  getShelterById,
  listShelters,
  nearbyShelters,
  updateShelter,
  deleteShelter,
} = await import("../../../controllers/shelterController.js");

describe("Shelter Controller - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------
  // createShelter
  // -------------------------
  describe("createShelter", () => {
    test("should return 400 if required fields are missing", async () => {
      const req = {
        user: { _id: "u1" },
        body: { name: "Test" }, // missing many
        io: { emit: jest.fn() },
      };
      const res = makeRes();

      await createShelter(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining("Missing required fields"),
        })
      );
      expect(createMock).not.toHaveBeenCalled();
    });

    test("should return 400 if location.coordinates is invalid", async () => {
      const req = {
        user: { _id: "u1" },
        body: {
          name: "Shelter A",
          address: { city: "Colombo", province: "Western", postalCode: "00100" },
          contact: { phone: "+94112223344" },
          capacity: { total: 10 },
          supports: { disasterTypes: ["FLOOD"] },
          location: { coordinates: [79.86] }, // invalid
        },
        io: { emit: jest.fn() },
      };
      const res = makeRes();

      await createShelter(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining("location.coordinates"),
        })
      );
      expect(createMock).not.toHaveBeenCalled();
    });

    test("should return 201, create shelter, and emit shelter:created", async () => {
      const ioEmit = jest.fn();

      const req = {
        user: { _id: "u1" },
        io: { emit: ioEmit },
        body: {
          name: "Colombo Central Shelter",
          description: "Emergency shelter",
          shelterType: "SCHOOL",
          images: [],
          managedBy: [],
          address: {
            street: "123 Main Street",
            city: "Colombo",
            province: "Western",
            postalCode: "00100",
          },
          contact: { phone: "+94112223344", email: "a@b.com" },
          location: { type: "Point", coordinates: [79.8612, 6.9271] },
          capacity: { total: 100 },
          occupancy: { current: 20 },
          supports: { disasterTypes: ["FLOOD"], medical: true },
          specialSupport: { elderlySupport: true },
          status: "OPEN",
          verified: true,
        },
      };

      const res = makeRes();

      const createdDoc = { _id: "s1", name: "Colombo Central Shelter" };
      createMock.mockResolvedValue(createdDoc);

      await createShelter(req, res);

      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Colombo Central Shelter",
          createdBy: "u1",
        })
      );

      expect(ioEmit).toHaveBeenCalledWith("shelter:created", createdDoc);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          shelter: createdDoc,
        })
      );
    });

    test("should return 500 if DB throws", async () => {
      const req = {
        user: { _id: "u1" },
        body: {
          name: "Shelter A",
          address: { city: "Colombo", province: "Western", postalCode: "00100" },
          contact: { phone: "+94112223344" },
          capacity: { total: 10 },
          supports: { disasterTypes: ["FLOOD"] },
          location: { coordinates: [79.8612, 6.9271] },
        },
      };
      const res = makeRes();

      createMock.mockRejectedValue(new Error("DB error"));

      await createShelter(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });

  // -------------------------
  // getShelterById
  // -------------------------
  describe("getShelterById", () => {
    test("should return 400 if id param missing", async () => {
      const req = { params: {} };
      const res = makeRes();

      await getShelterById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return 404 if shelter not found", async () => {
      findByIdMock.mockResolvedValue(null);

      const req = { params: { id: "s1" } };
      const res = makeRes();

      await getShelterById(req, res);

      expect(findByIdMock).toHaveBeenCalledWith("s1");
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should return 200 if shelter found", async () => {
      const shelter = { _id: "s1", name: "Shelter 1" };
      findByIdMock.mockResolvedValue(shelter);

      const req = { params: { id: "s1" } };
      const res = makeRes();

      await getShelterById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, shelter })
      );
    });
  });

  // -------------------------
  // listShelters
  // -------------------------
  describe("listShelters", () => {
    test("should return 200 with shelters + total", async () => {
      buildShelterQueryMock.mockReturnValue({ status: "OPEN" });

      // chain: find().sort().skip().limit()
      const limitFn = jest.fn().mockResolvedValue([{ _id: "s1" }]);
      const skipFn = jest.fn(() => ({ limit: limitFn }));
      const sortFn = jest.fn(() => ({ skip: skipFn }));
      findMock.mockReturnValue({ sort: sortFn });

      countDocumentsMock.mockResolvedValue(1);

      const req = { query: { page: "1", limit: "10", status: "OPEN" } };
      const res = makeRes();

      await listShelters(req, res);

      expect(buildShelterQueryMock).toHaveBeenCalledWith(req.query);
      expect(findMock).toHaveBeenCalledWith({ status: "OPEN", verified: true });
      expect(countDocumentsMock).toHaveBeenCalledWith({ status: "OPEN", verified: true });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          total: 1,
          shelters: [{ _id: "s1" }],
        })
      );
    });

    test("should return 500 on error", async () => {
      buildShelterQueryMock.mockReturnValue({});
      findMock.mockImplementation(() => {
        throw new Error("fail");
      });

      const req = { query: {} };
      const res = makeRes();

      await listShelters(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // -------------------------
  // nearbyShelters
  // -------------------------
  describe("nearbyShelters", () => {
    test("should return 400 if lng/lat invalid", async () => {
      const req = { query: {} };
      const res = makeRes();

      await nearbyShelters(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return 200 with nearby shelters", async () => {
      buildShelterQueryMock.mockReturnValue({ status: "OPEN" });

      // chain: find().limit()
      const limitFn = jest.fn().mockResolvedValue([{ _id: "s1" }]);
      findMock.mockReturnValue({ limit: limitFn });

      const req = {
        query: { lng: "79.8612", lat: "6.9271", radiusKm: "3", status: "OPEN" },
      };
      const res = makeRes();

      await nearbyShelters(req, res);

      expect(findMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "OPEN",
          location: expect.any(Object),
        })
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          shelters: [{ _id: "s1" }],
        })
      );
    });
  });

  // -------------------------
  // updateShelter
  // -------------------------
  describe("updateShelter", () => {
    test("should return 404 if shelter not found", async () => {
      findByIdAndUpdateMock.mockResolvedValue(null);

      const req = {
        params: { id: "s1" },
        body: { status: "CLOSED" },
        io: { emit: jest.fn() },
      };
      const res = makeRes();

      await updateShelter(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should update and emit shelter:updated and return updated doc", async () => {
      const ioEmit = jest.fn();
      const updatedDoc = { _id: "s1", status: "OPEN" };

      findByIdAndUpdateMock.mockResolvedValue(updatedDoc);

      const req = {
        params: { id: "s1" },
        body: {
          location: { coordinates: [79.0, 6.0] },
          status: "OPEN",
        },
        io: { emit: ioEmit },
      };
      const res = makeRes();

      await updateShelter(req, res);

      expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
        "s1",
        expect.any(Object),
        expect.objectContaining({ returnDocument: "after", runValidators: true })
      );

      // expects your controller emits UPDATED doc
      expect(ioEmit).toHaveBeenCalledWith("shelter:updated", updatedDoc);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          shelter: updatedDoc,
        })
      );
    });
  });

  // -------------------------
  // deleteShelter
  // -------------------------
  describe("deleteShelter", () => {
    test("should return 400 if id missing", async () => {
      const req = { params: {} };
      const res = makeRes();

      await deleteShelter(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return 404 if shelter not found", async () => {
      findByIdAndDeleteMock.mockResolvedValue(null);

      const req = { params: { id: "s1" }, io: { emit: jest.fn() } };
      const res = makeRes();

      await deleteShelter(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should delete and emit shelter:deleted", async () => {
      const ioEmit = jest.fn();
      findByIdAndDeleteMock.mockResolvedValue({ _id: "s1" });

      const req = { params: { id: "s1" }, io: { emit: ioEmit } };
      const res = makeRes();

      await deleteShelter(req, res);

      expect(ioEmit).toHaveBeenCalledWith("shelter:deleted", { _id: "s1" });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });
  });
});
