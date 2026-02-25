import { http } from "../../lib/httpClient.js";

const USGS = process.env.USGS_BASE_URL || "https://earthquake.usgs.gov";

export async function fetchEarthquakes({ start, end, minmag = 2.5, limit = 200, bbox }) {
  const url = `${USGS}/fdsnws/event/1/query`;

  const { data } = await http.get(url, {
    params: {
      format: "geojson",
      eventtype: "earthquake",
      starttime: start,
      endtime: end,
      minmagnitude: minmag,
      limit,
      orderby: "time",
      minlatitude: bbox.minLat,
      maxlatitude: bbox.maxLat,
      minlongitude: bbox.minLng,
      maxlongitude: bbox.maxLng,
    },
  });

  return data; // GeoJSON FeatureCollection
}
