import { http } from "../../lib/httpClient.js";

const BASE = process.env.RELIEFWEB_BASE_URL ||"https://api.reliefweb.int/v1";
const APPNAME = process.env.RELIEFWEB_APPNAME || "H67vXT-RescueNetHgTNcdRMnTux";

export async function fetchReliefWebReports({ query = "Sri Lanka", limit = 20 }) {
  const url = `${BASE}/reports`;

  const payload = {
    query: { value: query },
    limit,
    sort: ["date:desc"],
    fields: {
      include: ["id", "title", "date", "url", "source.name", "country.name", "disaster.name"],
    },
  };

  const { data } = await http.post(url, payload, {
    params: { appname: APPNAME }, // ✅ REQUIRED
    headers: { "Content-Type": "application/json" },
    timeout: 20000,
  });

  return data;
}

export async function fetchReliefWebDisasters({ query = "Sri Lanka", limit = 20 }) {
  const url = `${BASE}/disasters`;

  const payload = {
    query: { value: query },
    limit,
    sort: ["date:desc"],
    fields: {
      include: ["id", "name", "date", "url", "type.name", "country.name"],
    },
  };

  const { data } = await http.post(url, payload, {
    params: { appname: APPNAME }, // ✅ REQUIRED
    headers: { "Content-Type": "application/json" },
    timeout: 20000,
  });

  return data;
}
