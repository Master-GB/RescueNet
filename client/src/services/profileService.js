import apiClient from "./apiClient";

export const createCitizenProfile = async (payload) => {
  const response = await apiClient.post("/api/citizen/profile-create", payload);
  return response.data;
};

export const createVolunteerProfile = async (payload) => {
  const response = await apiClient.post("/api/volunteer/profile-create", payload);
  return response.data;
};

export const createNgoProfile = async (payload) => {
  const response = await apiClient.post("/api/ngo/profile-create", payload);
  return response.data;
};
