import apiClient from "./apiClient";

const ADMIN_PROFILE_ENDPOINTS = {
  GET: "/api/admin/profile-get",
  UPDATE: "/api/admin/profile-update",
  DELETE: "/api/admin/profile-delete",
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

export const getAdminProfile = async () => {
  try {
    const response = await apiClient.get(ADMIN_PROFILE_ENDPOINTS.GET);
    return response.data;
  } catch (error) {
    throw toServiceError(error, "Failed to load admin profile.");
  }
};

export const updateAdminProfile = async (payload) => {
  try {
    const response = await apiClient.patch(ADMIN_PROFILE_ENDPOINTS.UPDATE, payload);
    return response.data;
  } catch (error) {
    throw toServiceError(error, "Failed to update admin profile.");
  }
};

export const deleteAdminProfile = async () => {
  try {
    const response = await apiClient.delete(ADMIN_PROFILE_ENDPOINTS.DELETE);
    return response.data;
  } catch (error) {
    throw toServiceError(error, "Failed to delete admin account.");
  }
};
