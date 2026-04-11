import apiClient from "./apiClient";

export const getApiErrorMessage = (
  error,
  fallbackMessage = "Something went wrong. Please try again.",
) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
};

export const registerUser = async (payload) => {
  const response = await apiClient.post("/api/auth/register", payload);
  return response.data;
};

export const loginUser = async (payload) => {
  const response = await apiClient.post("/api/auth/login", payload);
  return response.data;
};

export const logoutUser = async () => {
  const response = await apiClient.post("/api/auth/logout");
  return response.data;
};

export const fetchMe = async () => {
  const response = await apiClient.get("/api/auth/me", {
    params: {
      _ts: Date.now(),
    },
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });
  return response.data;
};

export const sendOtp = async () => {
  const response = await apiClient.post("/api/auth/send-otp", {});
  return response.data;
};

export const verifyAccount = async (otp) => {
  const response = await apiClient.post("/api/auth/verify-account", { otp });
  return response.data;
};

export const sendResetOtp = async (email) => {
  const response = await apiClient.post("/api/auth/send-reset-otp", { email });
  return response.data;
};

export const verifyResetOtp = async ({ email, code }) => {
  const response = await apiClient.post("/api/auth/verify-reset-otp", {
    email,
    code,
  });
  return response.data;
};

export const resetPassword = async ({ email, newPassword }) => {
  const response = await apiClient.post("/api/auth/reset-password", {
    email,
    newPassword,
  });
  return response.data;
};
