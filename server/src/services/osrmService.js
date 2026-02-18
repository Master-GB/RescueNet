import { http } from "../lib/httpClient.js";

const OSRM_BASE = process.env.OSRM_BASE_URL || "https://router.project-osrm.org";

// driving | walking | cycling
export async function getRoute({ profile = "driving", from, to, alternatives = true }) {
  // from/to: [lng, lat]
  const url =
    `${OSRM_BASE}/route/v1/${profile}` +
    `/${from[0]},${from[1]};${to[0]},${to[1]}` +
    `?alternatives=${alternatives ? "true" : "false"}` +
    `&overview=full&geometries=geojson&steps=true`;

  const { data } = await http.get(url);
  return data;
}
