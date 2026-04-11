import apiClient from "./apiClient";

const ADMIN_NGO_ENDPOINTS = {
  LIST: "/api/admin/ngos",
  REGISTER: "/api/admin/ngos/register",
  DETAIL: (id) => `/api/admin/ngos/${id}`,
  VERIFY: (userId) => `/api/adminUser/verify-ngo/${userId}`,
};

const DEFAULT_PAGINATION = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
};

const extractApiErrorMessage = (error) => {
  if (!error) {
    return "Unknown error";
  }

  if (error.response && error.response.data) {
    const data = error.response.data;
    if (typeof data === "string") {
      return data;
    }

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

const cleanArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
};

const normalizeNgo = (ngo = {}) => {
  return {
    ...ngo,
    organizationName:
      ngo.organizationName
      || ngo.userId?.name
      || ngo.contactPerson
      || ngo.registrationNumber
      || "Unknown NGO",
    officialEmail: ngo.officialEmail || ngo.userId?.email || "",
    contactPerson: ngo.contactPerson || ngo.userId?.name || "",
    services: cleanArray(ngo.services),
    serviceDistricts: cleanArray(ngo.serviceDistricts),
  };
};

export const listAdminNgos = async (params = {}) => {
  try {
    const response = await apiClient.get(ADMIN_NGO_ENDPOINTS.LIST, {
      params: cleanParams(params),
    });

    const payload = response.data || {};
    const ngoList = Array.isArray(payload.data) ? payload.data : [];

    return {
      ...payload,
      data: ngoList.map((ngo) => normalizeNgo(ngo)),
      pagination: payload.pagination || DEFAULT_PAGINATION,
    };
  } catch (error) {
    throw toServiceError(error, "Failed to fetch NGO profiles");
  }
};

export const getAdminNgoById = async (ngoId) => {
  try {
    const response = await apiClient.get(ADMIN_NGO_ENDPOINTS.DETAIL(ngoId));
    const payload = response.data || {};

    return {
      ...payload,
      data: payload.data ? normalizeNgo(payload.data) : null,
    };
  } catch (error) {
    throw toServiceError(error, "Failed to fetch NGO profile details");
  }
};

export const registerAdminNgo = async (payload) => {
  try {
    const response = await apiClient.post(ADMIN_NGO_ENDPOINTS.REGISTER, payload);
    const responsePayload = response.data || {};

    return {
      ...responsePayload,
      data: {
        ...responsePayload.data,
        ngo: responsePayload?.data?.ngo ? normalizeNgo(responsePayload.data.ngo) : null,
      },
    };
  } catch (error) {
    throw toServiceError(error, "Failed to register NGO profile");
  }
};

export const updateAdminNgo = async (ngoId, payload) => {
  try {
    const response = await apiClient.patch(ADMIN_NGO_ENDPOINTS.DETAIL(ngoId), payload);
    const responsePayload = response.data || {};

    return {
      ...responsePayload,
      data: responsePayload.data ? normalizeNgo(responsePayload.data) : null,
    };
  } catch (error) {
    throw toServiceError(error, "Failed to update NGO profile");
  }
};

export const verifyAdminNgo = async (userId) => {
  try {
    const response = await apiClient.patch(ADMIN_NGO_ENDPOINTS.VERIFY(userId));
    const payload = response.data || {};

    return {
      ...payload,
      profile: payload.profile ? normalizeNgo(payload.profile) : null,
    };
  } catch (error) {
    throw toServiceError(error, "Failed to verify NGO profile");
  }
};

export const deleteAdminNgo = async (ngoId) => {
  try {
    const response = await apiClient.delete(ADMIN_NGO_ENDPOINTS.DETAIL(ngoId));
    return response.data;
  } catch (error) {
    throw toServiceError(error, "Failed to delete NGO profile");
  }
};
