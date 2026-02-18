import { http } from "../lib/httpClient.js";

const NOMINATIM_BASE = process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org";

function nominatimHeaders() {
  // Nominatim policy: identify your application
  const app = process.env.APP_NAME || "RescueNet";
  const email = process.env.CONTACT_EMAIL || "mastergba2001@gmail.com";

  return {
    "User-Agent": `${app} (${email})`,
    "Accept-Language": "en",
  };
}

// Address -> coordinates
export async function geocode({ q, limit = 5, countrycodes = "lk" }) {
  const url = `${NOMINATIM_BASE}/search`;
  const { data } = await http.get(url, {
    headers: nominatimHeaders(),
    params: {
      q,
      format: "json",
      addressdetails: 1,
      limit,
      countrycodes,
    },
  });
  return data;
}

// Coordinates -> address
export async function reverseGeocode({ lat, lng }) {
  const url = `${NOMINATIM_BASE}/reverse`;
  const { data } = await http.get(url, {
    headers: nominatimHeaders(),
    params: {
      lat,
      lon: lng,
      format: "json",
      addressdetails: 1,
    },
  });
  return data;
}
