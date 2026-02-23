import { getWeatherData } from "../utils/WeatherService.js";

/**
 * GET /api/weather/current
 * Query params: city (optional), lat (optional), lon (optional)
 */
export async function getCurrentWeather(req, res) {
  try {
    const { city, lat, lon } = req.query;
    
    // Call the service
    const data = await getWeatherData({ city, lat, lon });

    if (data?.error) {
      return res.status(400).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error("Weather Controller Error:", err);
    res.status(500).json({ 
      message: "Server Error", 
      error: err?.message || String(err) 
    });
  }
}
