import apiClient from "./apiClient";

const DASHBOARD_ENDPOINTS = {
  HELP_REQUESTS: "/api/admin/help-requests",
  NGOS: "/api/admin/ngos",
};

const DEFAULT_QUERY = {
  page: 1,
  limit: 250,
};

const extractApiErrorMessage = (error) => {
  if (!error) return "Unknown error";

  if (error.response && error.response.data) {
    const data = error.response.data;
    if (typeof data === "string") return data;
    return data.message || data.error || JSON.stringify(data);
  }

  return error.message || String(error);
};

const toServiceError = (error, fallbackMessage) => {
  const message = extractApiErrorMessage(error) || fallbackMessage;
  const serviceError = new Error(message);
  serviceError.statusCode = error?.response?.status;
  serviceError.originalError = error;
  return serviceError;
};

const cleanParams = (params = {}) => {
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      acc[key] = value;
    }

    return acc;
  }, {});
};

export const getAdminDashboardHelpRequests = async (params = {}) => {
  try {
    const response = await apiClient.get(DASHBOARD_ENDPOINTS.HELP_REQUESTS, {
      params: cleanParams({
        ...DEFAULT_QUERY,
        ...params,
      }),
    });

    const payload = response.data || {};

    return {
      ...payload,
      data: Array.isArray(payload.data) ? payload.data : [],
    };
  } catch (error) {
    throw toServiceError(error, "Failed to fetch help request data");
  }
};

export const getAdminDashboardNgos = async (params = {}) => {
  try {
    const response = await apiClient.get(DASHBOARD_ENDPOINTS.NGOS, {
      params: cleanParams({
        ...DEFAULT_QUERY,
        ...params,
      }),
    });

    const payload = response.data || {};

    return {
      ...payload,
      data: Array.isArray(payload.data) ? payload.data : [],
    };
  } catch (error) {
    throw toServiceError(error, "Failed to fetch NGO data");
  }
};

export const fetchAdminDashboardRawData = async ({
  helpRequestParams = {},
  ngoParams = {},
} = {}) => {
  try {
    const [helpRequestResponse, ngoResponse] = await Promise.all([
      getAdminDashboardHelpRequests(helpRequestParams),
      getAdminDashboardNgos(ngoParams),
    ]);

    return {
      helpRequests: Array.isArray(helpRequestResponse.data) ? helpRequestResponse.data : [],
      ngos: Array.isArray(ngoResponse.data) ? ngoResponse.data : [],
      helpRequestPagination: helpRequestResponse.pagination || null,
      ngoPagination: ngoResponse.pagination || null,
    };
  } catch (error) {
    throw toServiceError(error, "Failed to load dashboard data");
  }
};
