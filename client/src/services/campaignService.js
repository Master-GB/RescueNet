import apiClient from "./apiClient";

const extractApiErrorMessage = (error) => {
  if (!error) return "Unknown error";
  // Axios-style response body
  if (error.response && error.response.data) {
    const data = error.response.data;
    if (typeof data === "string") return data;
    return data.message || data.error || JSON.stringify(data);
  }
  return error.message || String(error);
};

const toCleanStringArray = (items = []) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => String(item || "").trim())
    .filter(Boolean);
};

const toCampaignFormData = (payload = {}) => {
  const formData = new FormData();
  const acceptedItems = toCleanStringArray(payload.acceptedItems);
  const bankDetails = payload.bankDetails || {};

  formData.append("title", String(payload.title || "").trim());
  formData.append("description", String(payload.description || "").trim());
  formData.append("targetAmount", String(payload.targetAmount || ""));
  formData.append(
    "bankDetails",
    JSON.stringify({
      accountName: String(bankDetails.accountName || "").trim(),
      accountNumber: String(bankDetails.accountNumber || "").trim(),
      bankName: String(bankDetails.bankName || "").trim(),
      branchName: String(bankDetails.branchName || "").trim(),
    }),
  );
  formData.append("acceptedItems", JSON.stringify(acceptedItems));

  if (payload.status) {
    formData.append("status", payload.status);
  }

  if (payload.campaignImage instanceof File) {
    formData.append("campaignImage", payload.campaignImage);
  }

  return formData;
};

export const listMyCampaigns = async ({ status } = {}) => {
  try {
    const params = {};
    if (status) params.status = status;

    const response = await apiClient.get("/api/campaigns/my-campaigns", { params });
    return response.data;
  } catch (err) {
    const message = extractApiErrorMessage(err);
    console.error("listMyCampaigns failed:", message, err);
    throw new Error(message);
  }
};

export const createCampaign = async (payload) => {
  try {
    const response = await apiClient.post(
      "/api/campaigns/create",
      toCampaignFormData(payload),
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (err) {
    const message = extractApiErrorMessage(err);
    console.error("createCampaign failed:", message, err);
    throw new Error(message);
  }
};

export const updateCampaign = async (campaignId, payload) => {
  try {
    const response = await apiClient.put(
      `/api/campaigns/update/${campaignId}`,
      toCampaignFormData(payload),
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (err) {
    const message = extractApiErrorMessage(err);
    console.error("updateCampaign failed:", message, err);
    throw new Error(message);
  }
};

export const cancelCampaign = async (campaignId) => {
  try {
    const response = await apiClient.patch(`/api/campaigns/cancel/${campaignId}`);
    return response.data;
  } catch (err) {
    const message = extractApiErrorMessage(err);
    console.error("cancelCampaign failed:", message, err);
    throw new Error(message);
  }
};

export const getCampaignById = async (campaignId) => {
  try {
    const response = await apiClient.get(`/api/campaigns/${campaignId}`);
    return response.data;
  } catch (err) {
    const message = extractApiErrorMessage(err);
    console.error("getCampaignById failed:", message, err);
    throw new Error(message);
  }
};

export const updateCampaignStatus = async (campaignId, status) => {
  try {
    const response = await apiClient.put(`/api/campaigns/update/${campaignId}`, {
      status,
    });
    return response.data;
  } catch (err) {
    const message = extractApiErrorMessage(err);
    console.error("updateCampaignStatus failed:", message, err);
    throw new Error(message);
  }
};
