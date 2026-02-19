import { http } from "../../lib/httpClient.js";

const FIRMS =
  process.env.FIRMS_BASE_URL || "https://firms.modaps.eosdis.nasa.gov";

function getFirmsKey() {
  return process.env.FIRMS_MAP_KEY; // read at runtime (ESM safe)
}

function assertKey() {
  const key = getFirmsKey();
  if (!key) {
    const err = new Error("FIRMS_MAP_KEY not set in .env");
    err.status = 500;
    throw err;
  }
  return key;
}

function assertBBox(bbox) {
  if (
    !bbox ||
    typeof bbox.minLng !== "number" ||
    typeof bbox.minLat !== "number" ||
    typeof bbox.maxLng !== "number" ||
    typeof bbox.maxLat !== "number"
  ) {
    const err = new Error("bbox is required: minLng,minLat,maxLng,maxLat");
    err.status = 400;
    throw err;
  }

  // basic sanity
  if (bbox.minLng >= bbox.maxLng || bbox.minLat >= bbox.maxLat) {
    const err = new Error("Invalid bbox: min must be < max");
    err.status = 400;
    throw err;
  }
}

function parseCsvToRows(csvText) {
  const text = String(csvText || "").trim();
  if (!text) return [];

  const lines = text.split("\n");
  if (lines.length <= 1) return []; // header only OR empty

  const header = lines.shift().split(",").map((h) => h.trim());

  return lines.map((line) => {
    const cols = line.split(",");
    const obj = {};
    header.forEach((h, i) => {
      obj[h] = (cols[i] ?? "").trim();
    });
    return obj;
  });
}

/**
 * NASA FIRMS Hotspots (area/csv)
 * NOTE:
 * - FIRMS uses "last N days" not (start,end) date range
 * - Keep bbox reasonably small to avoid heavy responses/timeouts
 */
export async function fetchFireHotspots({
  bbox,
  source = "VIIRS_SNPP_NRT",
  days = 3,
}) {
  const key = assertKey();
  assertBBox(bbox);

  // days: limit to 1..3 (safe)
  const safeDays = Math.min(3, Math.max(1, Number(days) || 3));

  

  // build URL
  const url = `${FIRMS}/api/area/csv/${key}/${source}/${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}/${safeDays}`;

  const { data } = await http.get(url, {
    responseType: "text",
    headers: {
      Accept: "text/csv,*/*",
    },
  });

  return parseCsvToRows(data);
}
