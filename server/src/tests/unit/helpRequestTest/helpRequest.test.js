import { jest } from "@jest/globals";

// Mock Res function
function makeRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

// Mocks for HelpRequest model functions
const createMock = jest.fn();
const findMock = jest.fn();
const findByIdMock = jest.fn();
const findByIdAndDeleteMock = jest.fn();

// Mock for WeatherService
const getWeatherMock = jest.fn();

// IMPORTANT: mock modules BEFORE importing controller
await jest.unstable_mockModule("../../../models/HelpRequest.js", () => ({
  default: {
    create: createMock,
    find: findMock,
    findById: findByIdMock,
    findByIdAndDelete: findByIdAndDeleteMock,
  },
}));

await jest.unstable_mockModule("../../../utils/WeatherService.js", () => ({
  default: getWeatherMock,
}));

// Import controller AFTER mocks
const {
  createHelpRequest,
  getAllRequests,
  getHelpRequestById,
  updateHelpRequest,
  deleteHelpRequest,
} = await import("../../../controllers/helpController.js");

describe("Help Request Controller - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createHelpRequest", () => {
    test("should return 201 and auto-calculate urgency for flood", async () => {
      const req = {
        body: {
          name: "John Doe",
          location: "Location A",
          disasterType: "flood",
          message: "help",
        },
      };
      const res = makeRes();

      getWeatherMock.mockResolvedValue("Clear");
      const createdRequest = { ...req.body, urgency: "high", weatherCondition: "Clear", _id: "h1" };
      createMock.mockResolvedValue(createdRequest);

      await createHelpRequest(req, res);

      expect(getWeatherMock).toHaveBeenCalled();
      expect(createMock).toHaveBeenCalledWith(expect.objectContaining({
        urgency: "high",
        weatherCondition: "Clear"
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdRequest);
    });

    test("should return 201 and set urgency to high if weather is Rain", async () => {
      const req = {
        body: {
          name: "John Doe",
          location: "Location A",
          disasterType: "other",
          message: "help",
        },
      };
      const res = makeRes();

      getWeatherMock.mockResolvedValue("Rain");
      const createdRequest = { ...req.body, urgency: "high", weatherCondition: "Rain", _id: "h2" };
      createMock.mockResolvedValue(createdRequest);

      await createHelpRequest(req, res);

      expect(createMock).toHaveBeenCalledWith(expect.objectContaining({
        urgency: "high"
      }));
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("should return 201 and set urgency to medium if no high conditions met", async () => {
      const req = {
        body: {
          name: "John Doe",
          location: "Location A",
          disasterType: "other",
          message: "help",
        },
      };
      const res = makeRes();

      getWeatherMock.mockResolvedValue("Clear");
      const createdRequest = { ...req.body, urgency: "medium", weatherCondition: "Clear", _id: "h3" };
      createMock.mockResolvedValue(createdRequest);

      await createHelpRequest(req, res);

      expect(createMock).toHaveBeenCalledWith(expect.objectContaining({
        urgency: "medium"
      }));
    });

    test("should handle voice and image uploads", async () => {
      const req = {
        body: {
          name: "John Doe",
          voiceMessage: { data: "YmFzZTY0ZGF0YQ==", mimeType: "audio/wav" },
          images: [{ data: "aW1hZ2VkYXRh", mimeType: "image/png" }]
        },
      };
      const res = makeRes();

      getWeatherMock.mockResolvedValue("Clear");
      createMock.mockResolvedValue({});

      await createHelpRequest(req, res);

      expect(createMock).toHaveBeenCalledWith(expect.objectContaining({
        voiceMessage: expect.objectContaining({
          mimeType: "audio/wav"
        }),
        images: expect.arrayContaining([
          expect.objectContaining({ mimeType: "image/png" })
        ])
      }));
    });

    test("should return 500 if DB save fails", async () => {
      const req = { body: {} };
      const res = makeRes();
      getWeatherMock.mockResolvedValue("Clear");
      createMock.mockRejectedValue(new Error("DB error"));

      await createHelpRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Server Error" }));
    });
  });

  describe("getAllRequests", () => {
    test("should return all requests", async () => {
      const req = {};
      const res = makeRes();
      const mockResult = [{ name: "R1" }];
      const sortMock = jest.fn().mockResolvedValue(mockResult);
      findMock.mockReturnValue({ sort: sortMock });

      await getAllRequests(req, res);

      expect(findMock).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe("getHelpRequestById", () => {
    test("should return 404 if request not found", async () => {
      const req = { params: { id: "nonexistent" } };
      const res = makeRes();
      findByIdMock.mockResolvedValue(null);

      await getHelpRequestById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should return request if found", async () => {
      const req = { params: { id: "h1" } };
      const res = makeRes();
      const mockRequest = { _id: "h1", name: "R1" };
      findByIdMock.mockResolvedValue(mockRequest);

      await getHelpRequestById(req, res);

      expect(res.json).toHaveBeenCalledWith(mockRequest);
    });
  });

  describe("updateHelpRequest", () => {
    test("should update existing request", async () => {
      const req = {
        params: { id: "h1" },
        body: { name: "Updated Name" }
      };
      const res = makeRes();
      const mockRequest = { 
        name: "Old Name", 
        save: jest.fn().mockResolvedValue(true) 
      };
      findByIdMock.mockResolvedValue(mockRequest);

      await updateHelpRequest(req, res);

      expect(mockRequest.name).toBe("Updated Name");
      expect(mockRequest.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Help request updated" }));
    });

    test("should return 404 if request not found for update", async () => {
       const req = { params: { id: "h1" }, body: {} };
       const res = makeRes();
       findByIdMock.mockResolvedValue(null);
       await updateHelpRequest(req, res);
       expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("deleteHelpRequest", () => {
    test("should delete request", async () => {
      const req = { params: { id: "h1" } };
      const res = makeRes();
      findByIdAndDeleteMock.mockResolvedValue({ _id: "h1" });

      await deleteHelpRequest(req, res);

      expect(findByIdAndDeleteMock).toHaveBeenCalledWith("h1");
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Help request deleted successfully" }));
    });

    test("should return 404 if request not found for deletion", async () => {
      const req = { params: { id: "h1" } };
      const res = makeRes();
      findByIdAndDeleteMock.mockResolvedValue(null);

      await deleteHelpRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
