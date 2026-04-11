import apiClient from "./apiClient";

export const createCitizenProfile = async (payload) => {
  const response = await apiClient.post("/api/citizen/profile-create", payload);
  return response.data;
};

export const getCitizenProfile = async () => {
  const response = await apiClient.get("/api/citizen/profile-get");
  return response.data;
};

export const updateCitizenProfile = async (payload) => {
  const response = await apiClient.patch("/api/citizen/profile-update", payload);
  return response.data;
};

export const deleteCitizenProfile = async () => {
  const response = await apiClient.delete("/api/citizen/profile-delete");
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

export const getNgoProfile = async () => {
  const response = await apiClient.get("/api/ngo/profile-get");
  return response.data;
};

export const updateNgoStatus = async (payload) => {
  const response = await apiClient.patch("/api/ngo/profile/status-update", payload);
  return response.data;
};

export const updateAccountProfileImage = async ({ file = null, remove = false } = {}) => {
  if (!(file instanceof File) && !remove) {
    throw new Error("Provide a profile image file or set remove=true.");
  }

  const formData = new FormData();

  if (file instanceof File) {
    formData.append("profileImage", file);
  }

  if (remove) {
    formData.append("removeProfileImage", "true");
  }

  const response = await apiClient.patch("/api/auth/profile-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
