const jsonHeaders = {
  "Content-Type": "application/json",
};

const toQueryString = (params) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });

  return query.toString();
};

const apiRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    credentials: "include",
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || data?.error || "Request failed";
    throw new Error(message);
  }

  return data;
};

export const getCurrentCoordinates = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => resolve(null),
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 300000,
      }
    );
  });
};

export const fetchAreaSituation = async (coords) => {
  const query = toQueryString({
    lat: coords?.lat,
    lon: coords?.lon,
    radius: 20,
  });

  return apiRequest(`/api/area/situation${query ? `?${query}` : ""}`);
};

export const fetchCurrentWeather = async (coords) => {
  const query = toQueryString({
    lat: coords?.lat,
    lon: coords?.lon,
  });

  return apiRequest(`/api/weather/current${query ? `?${query}` : ""}`);
};

export const fetchHelpRequests = async (limit = 20) => {
  const query = toQueryString({ limit });
  return apiRequest(`/api/help?${query}`);
};

export const fetchVolunteerProfile = async () => {
  return apiRequest("/api/volunteer/profile-get");
};

export const fetchTeamPresence = async () => {
  return apiRequest("/api/volunteer/team-presence");
};

export const updateVolunteerAvailability = async (availabilityStatus) => {
  return apiRequest("/api/volunteer/profile/status-update", {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify({ availabilityStatus }),
  });
};

export const acceptHelpRequest = async (helpRequestId, payload = {}) => {
  return apiRequest(`/api/help/update/${helpRequestId}`, {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify({ status: "assigned", ...payload }),
  });
};
