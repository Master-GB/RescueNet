import apiClient from "./apiClient";

const extractApiErrorMessage = (error) => {
  if (!error) return "Unknown error";

  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === "string") return data;
    return data.message || data.error || JSON.stringify(data);
  }

  return error.message || String(error);
};

export const listCampaignDonations = async (campaignId, { status } = {}) => {
  try {
    const params = {};
    if (status) {
      params.status = status;
    }

    const response = await apiClient.get(`/api/donations/campaign/${campaignId}`, {
      params,
    });

    return response.data;
  } catch (error) {
    const message = extractApiErrorMessage(error);
    console.error("listCampaignDonations failed:", message, error);
    throw new Error(message);
  }
};

export const getDonationById = async (donationId) => {
  try {
    const response = await apiClient.get(`/api/donations/${donationId}`);
    return response.data;
  } catch (error) {
    const message = extractApiErrorMessage(error);
    console.error("getDonationById failed:", message, error);
    throw new Error(message);
  }
};

export const verifyDonationByNgo = async (donationId, payload) => {
  try {
    const response = await apiClient.put(`/api/donations/verify/${donationId}`, payload);
    return response.data;
  } catch (error) {
    const message = extractApiErrorMessage(error);
    console.error("verifyDonationByNgo failed:", message, error);
    throw new Error(message);
  }
};
