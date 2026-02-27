import express from "express";
import { getCurrentWeather } from "../controllers/weatherController.js";

const router = express.Router();

// GET /api/weather/current?city=London
// or /api/weather/current?lat=...&lon=...
router.get("/current", getCurrentWeather);

export default router;
