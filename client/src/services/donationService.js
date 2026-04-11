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

const toApiError = (error) => {
  const message = extractApiErrorMessage(error);
  const apiError = new Error(message);
  apiError.statusCode = error?.response?.status;
  apiError.responseData = error?.response?.data;
  return apiError;
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
    const apiError = toApiError(error);
    console.error(
      `listCampaignDonations failed (status ${apiError.statusCode ?? "unknown"}):`,
      apiError.message,
      error,
    );
    throw apiError;
  }
};

export const getDonationById = async (donationId) => {
  try {
    const response = await apiClient.get(`/api/donations/${donationId}`);
    return response.data;
  } catch (error) {
    const apiError = toApiError(error);
    console.error(
      `getDonationById failed (status ${apiError.statusCode ?? "unknown"}):`,
      apiError.message,
      error,
    );
    throw apiError;
  }
};

export const verifyDonationByNgo = async (donationId, payload) => {
  try {
    const response = await apiClient.put(`/api/donations/verify/${donationId}`, payload);
    return response.data;
  } catch (error) {
    const apiError = toApiError(error);
    console.error(
      `verifyDonationByNgo failed (status ${apiError.statusCode ?? "unknown"}):`,
      apiError.message,
      error,
    );
    throw apiError;
  }
};

export const submitDonation = async (payload) => {
  try {
    const formData = new FormData();
    formData.append("campaignId", payload.campaignId);
    formData.append("donationType", payload.donationType || "Money");
    formData.append("declaredAmount", payload.declaredAmount || 0);
    formData.append("donorMessage", payload.donorMessage || "");

    if (payload.proofImage instanceof File) {
      formData.append("proofImage", payload.proofImage);
    }

    const response = await apiClient.post("/api/donations/submit", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    const apiError = toApiError(error);
    console.error(
      `submitDonation failed (status ${apiError.statusCode ?? "unknown"}):`,
      apiError.message,
      error,
    );

    const debugText = String(apiError.message || "").toLowerCase();
    if (debugText.includes("api_key") || debugText.includes("cloudinary")) {
      console.error(
        "Donation upload debug hint: check server CLOUDINARY_API_KEY/CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_SECRET in .env",
      );
    }

    throw apiError;
  }
};
