import { cache, cacheKey } from "../lib/cache.js";
import { getRoute } from "../services/osrmService.js";
import { geocode, reverseGeocode } from "../services/nominatimService.js";

/**
 * GET /api/geo/route?fromLng=&fromLat=&toLng=&toLat=&profile=driving&alternatives=true
 */
export const route = async (req, res) => {
  try {
    const key = cacheKey(req);
    const cached = cache.get(key);
    if (cached) return res.status(200).json({ success: true, source: "cache", data: cached });

    const fromLng = Number(req.query.fromLng);
    const fromLat = Number(req.query.fromLat);
    const toLng = Number(req.query.toLng);
    const toLat = Number(req.query.toLat);
    const profile = req.query.profile || "driving";
    const alternatives = (req.query.alternatives ?? "true") === "true";

    if ([fromLng, fromLat, toLng, toLat].some(Number.isNaN)) {
      return res.status(400).json({ success: false, message: "fromLng, fromLat, toLng, toLat are required numbers" });
    }

    const data = await getRoute({
      profile,
      from: [fromLng, fromLat],
      to: [toLng, toLat],
      alternatives,
    });

    cache.set(key, data);
    return res.status(200).json({ success: true, source: "osrm", data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Routing failed", error: error.message });
  }
};

/**
 * GET /api/geo/geocode?q=Colombo%20Sri%20Lanka&limit=5
 */
export const geocodeAddress = async (req, res) => {
  try {
    const key = cacheKey(req);
    const cached = cache.get(key);
    if (cached) return res.status(200).json({ success: true, source: "cache", data: cached });

    const q = (req.query.q || "").trim();
    const limit = Number(req.query.limit || 5);

    if (!q) {
      return res.status(400).json({ success: false, message: "q (address) is required" });
    }

    const data = await geocode({ q, limit });
    cache.set(key, data);

    return res.status(200).json({ success: true, source: "nominatim", data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Geocoding failed", error: error.message });
  }
};

/**
 * GET /api/geo/reverse?lat=6.9271&lng=79.8612
 */
export const reverseAddress = async (req, res) => {
  try {
    const key = cacheKey(req);
    const cached = cache.get(key);
    if (cached) return res.status(200).json({ success: true, source: "cache", data: cached });

    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);

    if ([lat, lng].some(Number.isNaN)) {
      return res.status(400).json({ success: false, message: "lat and lng are required numbers" });
    }

    const data = await reverseGeocode({ lat, lng });
    cache.set(key, data);

    return res.status(200).json({ success: true, source: "nominatim", data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Reverse geocoding failed", error: error.message });
  }
};


