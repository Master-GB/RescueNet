import { http } from "../../lib/httpClient.js";

const BASE = process.env.RELIEFWEB_BASE_URL ||"https://api.reliefweb.int/v2";
const APPNAME = process.env.RELIEFWEB_APPNAME || "H67vXT-RescueNetHgTNcdRMnTux";

export async function fetchReliefWebReports({ query = "Sri Lanka", limit = 20 }) {
  const url = `${BASE}/reports`;

  const payload = {
    filter: {
      operator: "AND",
      conditions: [
        {
          field: "country",
          value: query,
          operator: "AND"
        }
      ]
    },
    sort: ["date:desc"],
    limit,
    fields: {
      include: ["id", "title", "date", "url", "source", "country"]
    }
  };

  const { data } = await http.post(url, payload, {
    params: { appname: APPNAME }, // Required for v2
    headers: { "Content-Type": "application/json" },
    timeout: 20000,
  });

  return data;
}

export async function fetchReliefWebDisasters({ query = "Sri Lanka", limit = 20 }) {
  const url = `${BASE}/disasters`;

  const payload = {
    filter: {
      operator: "AND",
      conditions: [
        {
          field: "country",
          value: query,
          operator: "AND"
        }
      ]
    },
    sort: ["date:desc"],
    limit,
    fields: {
      include: ["id", "name", "date", "url", "country"]
    }
  };

  const { data } = await http.post(url, payload, {
    params: { appname: APPNAME }, // Required for v2
    headers: { "Content-Type": "application/json" },
    timeout: 20000,
  });

  return data;
}
