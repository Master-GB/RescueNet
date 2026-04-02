// Global mock setup for integration tests
import { jest } from "@jest/globals";

// Create mock HTTP client instance
const mockHttpClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

// Create proper axios mock with default export
const mockAxios = {
  create: jest.fn(() => mockHttpClient),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

// Mock axios properly for disasters API
jest.unstable_mockModule("axios", () => ({
  default: mockAxios,
  create: mockAxios.create,
  get: mockAxios.get,
  post: mockAxios.post,
  put: mockAxios.put,
  delete: mockAxios.delete
}));

// Mock the httpClient module directly
jest.unstable_mockModule("../../../lib/httpClient.js", () => ({
  http: mockHttpClient
}));

// Mock other external services that disasters API might use
jest.unstable_mockModule("fast-xml-parser", () => ({
  XMLParser: jest.fn().mockImplementation(() => ({
    parse: jest.fn().mockReturnValue({
      rss: {
        channel: {
          item: []
        }
      }
    })
  }))
}));

console.log("🔧 Axios and HTTP client mocks configured for disasters API");
