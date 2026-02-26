export function toFeatureCollection(features = []) {
  return { type: "FeatureCollection", features };
}

export function normalizeUSGS(eqGeojson) {
  // already GeoJSON
  return eqGeojson;
}

// If GDACS response isn't strict GeoJSON, normalize to Points.
// Adjust mapping based on your actual GDACS response fields.
export function normalizeGDACS(raw) {
  // If it's already GeoJSON:
  if (raw?.type === "FeatureCollection" && Array.isArray(raw.features)) return raw;

  // Otherwise attempt to normalize from "events" array style
  const events = raw?.events || raw?.data || raw?.features || [];
  const features = [];

  for (const e of events) {
    const lat = Number(e.lat ?? e.latitude);
    const lng = Number(e.lon ?? e.lng ?? e.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) continue;

    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [lng, lat] },
      properties: {
        source: "GDACS",
        eventType: e.eventtype || e.type || "UNKNOWN",
        name: e.name || e.title || "GDACS Event",
        alertLevel: e.alertlevel || e.alert || null,
        url: e.url || e.link || null,
        raw: e,
      },
    });
  }

  return toFeatureCollection(features);
}

export function normalizeFIRMS(rows) {
  const features = [];

  for (const r of rows) {
    const lat = Number(r.latitude);
    const lng = Number(r.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) continue;

    const frp = Number(r.frp ?? 0);
    const conf = r.confidence ?? r.confidence_level ?? "";

    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [lng, lat] },
      properties: {
        source: "FIRMS",
        eventType: "FIRE",
        frp,
        confidence: conf,
        acq_date: r.acq_date,
        acq_time: r.acq_time,
        raw: r,
      },
    });
  }

  return toFeatureCollection(features);
}

// ReliefWeb usually isn't precise geo; we return items for UI list
export function normalizeReliefWebForList(raw) {
  const data = raw?.data || [];
  return data.map((item) => ({
    id: item.id,
    title: item.fields?.title || item.fields?.name || "ReliefWeb Item",
    url: item.fields?.url || item.href,
    date: item.fields?.date?.created || item.fields?.date?.changed,
    countries: item.fields?.country?.map((c) => c.name) || [],
    disasterTypes: item.fields?.disaster_type?.map((d) => d.name) || [],
    raw: item,
  }));
}

// Convert FeatureCollection -> heatmap points
export function featureCollectionToHeatPoints(fc, intensityFn) {
  const points = [];
  for (const f of fc?.features || []) {
    if (f?.geometry?.type !== "Point") continue;
    const [lng, lat] = f.geometry.coordinates || [];
    if (typeof lat !== "number" || typeof lng !== "number") continue;

    const intensity = intensityFn ? intensityFn(f) : 0.5;
    points.push({
      lat,
      lng,
      intensity,
      type: f.properties?.eventType || "UNKNOWN",
      source: f.properties?.source || "UNKNOWN",
      meta: f.properties || {},
    });
  }
  return points;
}
