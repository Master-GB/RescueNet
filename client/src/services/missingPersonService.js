import apiClient from "./apiClient";

const BASE = "/api/missing-persons";

// Get all missing persons (with optional filters)
export const fetchMissingPersons = async (params = {}) => {
  const response = await apiClient.get(BASE, { params });
  return response.data;
};

// Get single missing person by ID
export const fetchMissingPersonById = async (id) => {
  const response = await apiClient.get(`${BASE}/${id}`);
  return response.data;
};

// Report a new missing person
export const reportMissingPerson = async (formData) => {
  const response = await apiClient.post(BASE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Update a missing person report
export const updateMissingPerson = async (id, formData) => {
  const response = await apiClient.put(`${BASE}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Delete a missing person report
export const deleteMissingPerson = async (id) => {
  const response = await apiClient.delete(`${BASE}/${id}`);
  return response.data;
};

// Mark as found
export const markAsFound = async (id) => {
  const response = await apiClient.patch(`${BASE}/${id}/found`);
  return response.data;
};

// Add a sighting/tip
export const addSighting = async (id, data) => {
  const response = await apiClient.post(`${BASE}/${id}/sightings`, data);
  return response.data;
};