import apiClient from "./apiClient";
import { NGO_TASK_ENDPOINTS } from "../constants/ngoTaskConstants";

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

export const getNgoTasks = async (params = {}) => {
  try {
    const response = await apiClient.get(NGO_TASK_ENDPOINTS.HELP_REQUESTS, {
      params: cleanParams(params),
    });
    return response.data;
  } catch (error) {
    throw toServiceError(error, "Failed to fetch assigned tasks.");
  }
};

export const getNgoTaskPerformance = async () => {
  try {
    const response = await apiClient.get(NGO_TASK_ENDPOINTS.PERFORMANCE);
    return response.data;
  } catch (error) {
    throw toServiceError(error, "Failed to load task performance.");
  }
};

export const getNgoTaskById = async (requestId) => {
  try {
    const response = await apiClient.get(NGO_TASK_ENDPOINTS.HELP_REQUEST_BY_ID(requestId));
    return response.data;
  } catch (error) {
    throw toServiceError(error, "Failed to fetch task details.");
  }
};

export const acceptNgoTask = async (requestId) => {
  try {
    const response = await apiClient.patch(NGO_TASK_ENDPOINTS.ACCEPT_TASK(requestId));
    return response.data;
  } catch (error) {
    throw toServiceError(error, "Failed to accept task.");
  }
};

export const declineNgoTask = async (requestId, payload = {}) => {
  try {
    const response = await apiClient.patch(NGO_TASK_ENDPOINTS.DECLINE_TASK(requestId), payload);
    return response.data;
  } catch (error) {
    throw toServiceError(error, "Failed to decline task.");
  }
};

export const markNgoTaskInProgress = async (requestId) => {
  try {
    const response = await apiClient.patch(NGO_TASK_ENDPOINTS.MARK_IN_PROGRESS(requestId));
    return response.data;
  } catch (error) {
    throw toServiceError(error, "Failed to mark task as in progress.");
  }
};

export const completeNgoTask = async (requestId) => {
  try {
    const response = await apiClient.patch(NGO_TASK_ENDPOINTS.MARK_COMPLETE(requestId));
    return response.data;
  } catch (error) {
    throw toServiceError(error, "Failed to mark task as completed.");
  }
};
