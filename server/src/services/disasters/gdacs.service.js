import { http } from "../../lib/httpClient.js";
import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

function asArray(x) {
  if (!x) return [];
  return Array.isArray(x) ? x : [x];
}

function parseGeoPoint(item) {
  const lat = Number(item["geo:lat"]);
  const lng = Number(item["geo:long"]);
  if (!Number.isNaN(lat) && !Number.isNaN(lng)) return { lat, lng };

  const p = item["georss:point"];
  if (typeof p === "string") {
    const [latS, lngS] = p.trim().split(/\s+/);
    const lat2 = Number(latS);
    const lng2 = Number(lngS);
    if (!Number.isNaN(lat2) && !Number.isNaN(lng2)) return { lat: lat2, lng: lng2 };
  }

  const gp = item["geo:Point"];
  if (gp && typeof gp === "object") {
    const lat3 = Number(gp["geo:lat"]);
    const lng3 = Number(gp["geo:long"]);
    if (!Number.isNaN(lat3) && !Number.isNaN(lng3)) return { lat: lat3, lng: lng3 };
  }

  return null;
}

function inBBox(lat, lng, bbox) {
  if (!bbox) return true;
  return (
    lat >= bbox.minLat &&
    lat <= bbox.maxLat &&
    lng >= bbox.minLng &&
    lng <= bbox.maxLng
  );
}

function getGdacsEventType(item) {
  return String(item?.["gdacs:eventtype"] || "").trim().toUpperCase();
}

// Map GDACS codes -> your API types (what frontend expects)
function mapGdacsCodeToApiType(code) {
  switch (code) {
    case "FL":
      return "FLOOD";
    case "TS":
      return "TSUNAMI";
    case "TC":
      return "STORM"; // or "CYCLONE" if you prefer
    case "VO":
      return "VOLCANO";
    case "DR":
      return "DROUGHT";
    case "WF":
      return "WILDFIRE";
    default:
      return code; // fallback
  }
}

async function fetchRss(url) {
  const { data: xml } = await http.get(url, {
    responseType: "text",
    headers: {
      "User-Agent": process.env.APP_NAME || "RescueNet/1.0 ",
      Accept: "application/rss+xml, application/xml, text/xml",
    },
    timeout: 20000,
  });

  return parser.parse(xml);
}

/**
 * Fetch GDACS RSS for one event type code: FL, TS, TC, VO, DR, WF...
 * Strictly filters to that code (in case RSS includes noise).
 */
export async function fetchGdacsRssByCode({ gdacsCode, bbox }) {
  const code = String(gdacsCode || "").trim().toUpperCase();
  if (!code) {
    const err = new Error("gdacsCode is required (example: FL, TS, TC)");
    err.status = 400;
    throw err;
  }

  const url = `https://www.gdacs.org/xml/rss.xml?eventtype=${encodeURIComponent(code)}`;

  const parsed = await fetchRss(url);
  const channel = parsed?.rss?.channel;
  const items = asArray(channel?.item);

  const features = [];

  for (const item of items) {
    const itemType = getGdacsEventType(item);

    // ✅ strict filter: only keep what we asked for
    if (itemType !== code) continue;

    const geo = parseGeoPoint(item);
    if (!geo) continue;
    if (!inBBox(geo.lat, geo.lng, bbox)) continue;

    const apiType = mapGdacsCodeToApiType(code);

    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [geo.lng, geo.lat] },
      properties: {
        source: "GDACS",
        eventType: apiType,     // ✅ FLOOD / TSUNAMI / STORM / VOLCANO / DROUGHT / WILDFIRE
        gdacsType: code,        // ✅ FL / TS / TC / VO / DR / WF
        title: item.title || "",
        url: item.link || "",
        pubDate: item.pubDate || "",
        country: item["gdacs:country"] || "",
        alertLevel: item["gdacs:alertlevel"] || "",
        severity: item["gdacs:severity"] || "",
        population: item["gdacs:population"] || "",
        raw: item,
      },
    });
  }

  return { type: "FeatureCollection", features };
}
