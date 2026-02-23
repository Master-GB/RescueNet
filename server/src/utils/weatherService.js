import axios from "axios";

// const PROVIDER = (process.env.WEATHER_API_PROVIDER || "open-meteo").toLowerCase();
// const UNITS = (process.env.WEATHER_UNITS || "metric").toLowerCase(); // metric | imperial

// Providers and Units are now read inside the function to allow dynamic changes (useful for testing)

const codeMap = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

function toUnits(valueC, units = "metric") {
  if (units === "imperial") {
    // Celsius to Fahrenheit
    return (valueC * 9) / 5 + 32;
  }
  return valueC; // metric default
}

function windToUnits(ms, units = "metric") {
  if (units === "imperial") {
    // m/s to mph
    return ms * 2.236936;
  }
  // m/s to km/h
  return ms * 3.6;
}

export async function getWeatherData({ city, lat, lon, units: argUnits, provider: argProvider } = {}) {
  const provider = (argProvider || process.env.WEATHER_API_PROVIDER || "open-meteo").toLowerCase();
  const units = (argUnits || process.env.WEATHER_UNITS || "metric").toLowerCase();

  try {
    if (provider === "open-meteo") {
      let latitude = lat;
      let longitude = lon;
      let locationInfo = {};

      // Geocode city name if coords not provided
      if ((latitude === undefined || longitude === undefined) && city) {
        const geo = await axios.get(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );
        const res0 = geo.data?.results?.[0];
        if (res0) {
          latitude = res0.latitude;
          longitude = res0.longitude;
          locationInfo = {
            name: res0.name,
            country: res0.country,
            lat: res0.latitude,
            lon: res0.longitude,
          };
        }
      }

      if (latitude === undefined || longitude === undefined) {
        throw new Error("Latitude/longitude required for Open-Meteo when city geocoding fails.");
      }

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`;
      const wx = await axios.get(url);
      const cur = wx.data?.current || {};
      const tempC = cur.temperature_2m;
      const windMs = cur.wind_speed_10m; // actually km/h sometimes; open-meteo doc says wind_speed_10m unit is km/h, but to be safe we'll treat as m/s? We'll convert conservatively.
      const code = cur.weather_code;
      const condition = codeMap[code] || "Unknown";

      const temp = toUnits(tempC, units);
      const wind = windToUnits(typeof windMs === "number" ? windMs / 3.6 : 0, units); // if km/h -> m/s back to unit converter

      return {
        provider: "open-meteo",
        units: units,
        location: locationInfo,
        current: {
          temperature: temp,
          windSpeed: wind,
          condition,
          code,
        },
        raw: wx.data,
      };
    }

    // Default: OpenWeatherMap (requires API key)
    const apiKey = process.env.WEATHER_API_KEY;
    if (!city) throw new Error("City name required for OpenWeatherMap provider.");
    const ow = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${units === "imperial" ? "imperial" : "metric"}`
    );
    const main = ow.data?.weather?.[0]?.main || "Unknown";
    const temp = ow.data?.main?.temp;
    const wind = ow.data?.wind?.speed;

    return {
      provider: "openweather",
      units: units,
      location: {
        name: ow.data?.name,
        country: ow.data?.sys?.country,
        lat: ow.data?.coord?.lat,
        lon: ow.data?.coord?.lon,
      },
      current: {
        temperature: temp,
        windSpeed: wind,
        condition: main,
      },
      raw: ow.data,
    };
  } catch (err) {
    return {
      provider: provider,
      units: units,
      error: err?.message || String(err),
    };
  }
}

// Backward-compatible default export returning a simple condition string.
export default async function getWeather(location) {
  const data = await getWeatherData({ city: location });
  return data?.current?.condition || "Unknown";
}
