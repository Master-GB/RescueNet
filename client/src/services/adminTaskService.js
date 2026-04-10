import apiClient from "./apiClient";
import { ADMIN_TASK_ENDPOINTS } from "../constants/adminTaskConstants";

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

const getNgoDisplayName = (ngo = {}) => {
  return (
    ngo.organizationName
    || ngo.userId?.name
    || ngo.contactPerson
    || ngo.registrationNumber
    || "Unknown NGO"
  );
};

const normalizeNgo = (ngo = {}) => {
  return {
    ...ngo,
    organizationName: getNgoDisplayName(ngo),
    contactPerson: ngo.contactPerson || ngo.userId?.name || "",
    officialEmail: ngo.officialEmail || ngo.userId?.email || "",
  };
};

export const getAdminHelpRequests = async (params = {}) => {
  try {
    const response = await apiClient.get(ADMIN_TASK_ENDPOINTS.HELP_REQUESTS, {
      params: cleanParams(params),
    });
    return response.data;
  } catch (error) {
    throw toServiceError(error, "Failed to fetch help requests");
  }
};

export const getAdminHelpRequestById = async (id) => {
  try {
    const response = await apiClient.get(ADMIN_TASK_ENDPOINTS.HELP_REQUEST_BY_ID(id));
    return response.data;
  } catch (error) {
    throw toServiceError(error, "Failed to fetch help request details");
  }
};

export const assignAdminHelpRequest = async (id, payload) => {
  try {
    const response = await apiClient.post(
      ADMIN_TASK_ENDPOINTS.ASSIGN_HELP_REQUEST(id),
      payload,
    );
    return response.data;
  } catch (error) {
    throw toServiceError(error, "Failed to assign help request");
  }
};

export const updateAdminHelpRequest = async (id, payload) => {
  try {
    const response = await apiClient.patch(
      ADMIN_TASK_ENDPOINTS.HELP_REQUEST_BY_ID(id),
      payload,
    );
    return response.data;
  } catch (error) {
    throw toServiceError(error, "Failed to update help request");
  }
};

export const listAdminNgos = async (params = {}) => {
  try {
    const response = await apiClient.get(ADMIN_TASK_ENDPOINTS.NGOS, {
      params: cleanParams({
        page: 1,
        limit: 100,
        approvalStatus: "approved",
        ...params,
      }),
    });
    const payload = response.data || {};
    const ngoList = Array.isArray(payload?.data) ? payload.data : [];
    const normalizedNgos = ngoList.map((ngo) => normalizeNgo(ngo));

    return {
      ...payload,
      data: normalizedNgos,
    };
  } catch (error) {
    throw toServiceError(error, "Failed to fetch NGOs");
  }
};
