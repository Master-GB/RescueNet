import express from "express";
import { getWeatherData } from "../utils/WeatherService.js";

const router = express.Router();

// GET /api/weather/current?city=London
// or /api/weather/current?lat=...&lon=... (preferred for open-meteo)
router.get("/current", async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    const data = await getWeatherData({ city, lat, lon });

    if (data?.error) {
      return res.status(400).json(data);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err?.message || String(err) });
  }
});

export default router;
