import { cache, cacheKey } from "../lib/cache.js";
import { parseBBox } from "../lib/bbox.js";

import { fetchEarthquakes } from "../services/disasters/usgs.service.js";
import { fetchFireHotspots } from "../services/disasters/firms.service.js";
import {
  fetchReliefWebReports,
  fetchReliefWebDisasters,
} from "../services/disasters/reliefweb.service.js";

import { fetchGdacsRssByCode } from "../services/disasters/gdacs.service.js";

import {
  normalizeUSGS,
  normalizeFIRMS,
  normalizeReliefWebForList,
  featureCollectionToHeatPoints,
  toFeatureCollection,
} from "../services/disasters/normalize.js";

const ALLOWED_TYPES = [
  "EARTHQUAKE",
  "FIRE",
  "FLOOD",
  "TSUNAMI",
  "STORM",
  "CYCLONE",
  "VOLCANO",
  "DROUGHT",
  "WILDFIRE",
];
const GDACS_MAP = {
  FLOOD: "FL",
  TSUNAMI: "TS",
  STORM: "TC", // or CYCLONE -> TC
  CYCLONE: "TC", // optional alias
  VOLCANO: "VO",
  DROUGHT: "DR",
  WILDFIRE: "WF",
};

function getSingleType(req) {
  const raw = String(req.query.types || "").trim();
  if (!raw) {
    return { error: "types is required. Example: ?types=FIRE" };
  }

  const types = raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  if (types.length !== 1) {
    return {
      error: "Only ONE type is allowed at a time. Example: ?types=FIRE",
    };
  }

  const type = types[0];
  if (!ALLOWED_TYPES.includes(type)) {
    return { error: `Invalid type. Allowed: ${ALLOWED_TYPES.join(", ")}` };
  }

  return { type };
}

/**
 * GET /api/disasters/map
 * REQUIRED:
 *  - start=YYYY-MM-DD&end=YYYY-MM-DD
 *  - types=EARTHQUAKE | FIRE | FLOOD | TSUNAMI  (ONE ONLY)
 */
export const disastersMap = async (req, res) => {
  try {
    console.log("DISASTERS MAP HIT - TYPES:", req.query.types);
    const start = req.query.start;
    const end = req.query.end;
    
    const { type, error } = getSingleType(req);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const bbox = parseBBox(req.query);

    // cache per request (includes type because it's in query)
    const key = cacheKey(req);
    const cached = cache.get(key);
    if (cached) {
      return res
        .status(200)
        .json({ success: true, source: "cache", data: cached });
    }

    let features = [];

    // Fetch ONLY the requested type
    if (type === "EARTHQUAKE") {
        if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: "start and end are required (YYYY-MM-DD)",
      });
    }
      const eqRaw = await fetchEarthquakes({
        start,
        end,
        minmag: Number(req.query.minmag || 2.5),
        limit: 200,
        bbox,
      });
      features = normalizeUSGS(eqRaw).features;
    }

    if (type === "FIRE") {
      const days = Number(req.query.days || 3); // ✅ FIRMS uses days

      if (days > 3) {
        return res.status(400).json({
          success: false,
          message:
            "For FIRMS NRT sources, days must be <= 3. Use a different source for historical data.",
        });
      }

      const source = req.query.source || "VIIRS_SNPP_NRT";

      const firmsRaw = await fetchFireHotspots({ bbox, days, source });
      features = normalizeFIRMS(firmsRaw).features;
    }
    if (GDACS_MAP[type]) {
      const fc = await fetchGdacsRssByCode({
        gdacsCode: GDACS_MAP[type],
        bbox,
      });
      features = fc.features;
    }

    const data = toFeatureCollection(features);
    cache.set(key, data);

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: "Failed to fetch disaster map data",
      error: error.message,
    });
  }
};

/**
 * GET /api/disasters/heatmap
 * REQUIRED:
 *  - start=YYYY-MM-DD&end=YYYY-MM-DD
 *  - types=EARTHQUAKE | FIRE | FLOOD | TSUNAMI  (ONE ONLY)
 */
export const disastersHeatmap = async (req, res) => {
  try {
    const start = req.query.start;
    const end = req.query.end;

    const { type, error } = getSingleType(req);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const bbox = parseBBox(req.query);

    const key = cacheKey(req);
    const cached = cache.get(key);
    if (cached) {
      return res
        .status(200)
        .json({ success: true, source: "cache", data: cached });
    }

    let fc = { type: "FeatureCollection", features: [] };

    // Fetch ONLY the requested type and convert to FeatureCollection
    if (type === "EARTHQUAKE") {
         if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: "start and end are required (YYYY-MM-DD)",
      });
    }
      const eqRaw = await fetchEarthquakes({
        start,
        end,
        minmag: Number(req.query.minmag || 2.5),
        limit: 200,
        bbox,
      });
      fc = normalizeUSGS(eqRaw);
    }

    if (type === "FIRE") {
      const days = Number(req.query.days || 3);
      const source = req.query.source || "VIIRS_SNPP_NRT";

      const firmsRaw = await fetchFireHotspots({ bbox, days, source });
      fc = normalizeFIRMS(firmsRaw);
    }

    if (GDACS_MAP[type]) {
  fc = await fetchGdacsRssByCode({ gdacsCode: GDACS_MAP[type], bbox });
}
    const points = featureCollectionToHeatPoints(fc, (f) => {
      const src = String(f.properties?.source || "").toUpperCase();
      const et = String(f.properties?.eventType || "").toUpperCase();

      // USGS: magnitude -> intensity
      if (src === "USGS") {
        const mag = Number(
          f.properties?.mag ?? f.properties?.raw?.properties?.mag ?? 0,
        );
        return Math.min(1, Math.max(0.1, mag / 6));
      }

      // FIRMS: FRP -> intensity
      if (src === "FIRMS") {
        const frp = Number(f.properties?.frp ?? 0);
        return Math.min(1, Math.max(0.1, frp / 50));
      }

      // GDACS RSS (simple)
      if (et === "TSUNAMI" || et === "TS") return 0.9;
      if (et === "FLOOD" || et === "FL") return 0.7;

      return 0.5;
    });

    const data = { points, count: points.length, type };

    cache.set(key, data);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: "Failed to build disaster heatmap",
      error: error.message,
    });
  }
};

/**
 * GET /api/disasters/updates
 * (ReliefWeb list for UI panel)
 */
export const disasterUpdates = async (req, res) => {
  try {
    const key = cacheKey(req);
    const cached = cache.get(key);
    if (cached)
      return res
        .status(200)
        .json({ success: true, source: "cache", data: cached });

    const limit = Number(req.query.limit || 20);
    const q = String(req.query.q || "Sri Lanka");

    const [reports, disasters] = await Promise.all([
      fetchReliefWebReports({ query: q, limit }),
      fetchReliefWebDisasters({ country: q, limit }),
    ]);

    const data = {
      reports: normalizeReliefWebForList(reports),
      disasters: normalizeReliefWebForList(disasters),
    };

    cache.set(key, data);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch ReliefWeb updates",
      error: error.message,
      apiUrl: error?.config?.url,
    apiMethod: error?.config?.method,
    apiData: error?.config?.data,
    apiParams: error?.config?.params,
    status: error?.response?.status,
    apiError: error?.response?.data,
    error: error.message,
    });
  }
};
