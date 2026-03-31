import { jest } from "@jest/globals";

// Mock external HTTP client to avoid real network calls
export const mockHttpClient = {
  get: jest.fn(),
  post: jest.fn(),
};

// Mock weather service to avoid real weather API calls
export const mockWeatherService = {
  getWeatherData: jest.fn(),
  default: jest.fn(),
};

// Mock Hugging Face inference for image/voice analysis
export const mockHfInference = {
  automaticSpeechRecognition: jest.fn(),
  imageClassification: jest.fn(),
};

// Mock translation service
export const mockTranslate = jest.fn();

// Mock email sending
export const mockSendEmail = jest.fn();

// Mock file upload (Cloudinary)
export const mockUpload = jest.fn();

// Helper to reset all mocks
export function resetAllMocks() {
  jest.clearAllMocks();
  mockHttpClient.get.mockClear();
  mockHttpClient.post.mockClear();
  mockWeatherService.getWeatherData.mockClear();
  mockWeatherService.default.mockClear();
  mockHfInference.automaticSpeechRecognition.mockClear();
  mockHfInference.imageClassification.mockClear();
  mockTranslate.mockClear();
  mockSendEmail.mockClear();
  mockUpload.mockClear();
}
