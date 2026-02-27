import { jest } from "@jest/globals";

// Mock axios
const axiosGetMock = jest.fn();
await jest.unstable_mockModule("axios", () => ({
  default: {
    get: axiosGetMock,
  },
}));

// We need to re-import WeatherService after mocking modules
const { getWeatherData } = await import("../../../utils/WeatherService.js");

describe("WeatherService - Unit Tests", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("Open-Meteo Provider", () => {
    test("should fetch weather correctly with coordinates", async () => {
      axiosGetMock.mockResolvedValue({
        data: {
          current: {
            temperature_2m: 25,
            weather_code: 0,
            wind_speed_10m: 10,
          },
        },
      });

      const result = await getWeatherData({ lat: 6.9, lon: 79.8, provider: "open-meteo", units: "metric" });

      expect(axiosGetMock).toHaveBeenCalled();
      expect(result.current.temperature).toBe(25);
      expect(result.current.condition).toBe("Clear");
    });

    test("should geocode city and then fetch weather", async () => {
      axiosGetMock
        .mockResolvedValueOnce({
          data: {
            results: [{ name: "Colombo", country: "Sri Lanka", latitude: 6.9, longitude: 79.8 }],
          },
        })
        .mockResolvedValueOnce({
          data: {
            current: {
              temperature_2m: 30,
              weather_code: 1,
              wind_speed_10m: 36,
            },
          },
        });

      const result = await getWeatherData({ city: "Colombo", provider: "open-meteo", units: "metric" });

      expect(axiosGetMock).toHaveBeenCalledTimes(2);
      expect(result.location.name).toBe("Colombo");
      expect(result.current.temperature).toBe(30);
      expect(result.current.windSpeed).toBe(36);
    });
  });

  describe("OpenWeatherMap Provider", () => {
    test("should fetch weather from OpenWeatherMap", async () => {
      axiosGetMock.mockResolvedValue({
        data: {
          name: "London",
          sys: { country: "GB" },
          coord: { lat: 51.5, lon: -0.1 },
          weather: [{ main: "Clouds" }],
          main: { temp: 15 },
          wind: { speed: 5 },
        },
      });

      const result = await getWeatherData({ city: "London", provider: "openweather", units: "metric" });

      expect(axiosGetMock).toHaveBeenCalledWith(
        expect.stringContaining("openweathermap.org")
      );
      expect(result.current.condition).toBe("Clouds");
      expect(result.provider).toBe("openweather");
    });
  });

  describe("Unit Conversions", () => {
    test("should convert Celsius to Fahrenheit for imperial units", async () => {
      axiosGetMock.mockResolvedValue({
        data: {
          current: {
            temperature_2m: 0, // 0C = 32F
            weather_code: 0,
            wind_speed_10m: 0,
          },
        },
      });

      const result = await getWeatherData({ lat: 0, lon: 0, provider: "open-meteo", units: "imperial" });

      expect(result.current.temperature).toBe(32);
      expect(result.units).toBe("imperial");
    });
  });

  describe("Error Handling", () => {
    test("should return error object on API failure", async () => {
      axiosGetMock.mockRejectedValue(new Error("Network Error"));
      const result = await getWeatherData({ lat: 0, lon: 0 });
      expect(result.error).toBe("Network Error");
    });
  });
});
