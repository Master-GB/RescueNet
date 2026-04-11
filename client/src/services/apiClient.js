import axios from "axios";

axios.defaults.withCredentials = true;

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const unauthorizedListeners = new Set();

export const subscribeUnauthorized = (listener) => {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
};

apiClient.interceptors.request.use((config) => {
  config.withCredentials = true;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      unauthorizedListeners.forEach((listener) => {
        try {
          listener(error);
        } catch (listenerError) {
          // Keep interceptor chain stable even if a listener throws.
          console.error("Unauthorized listener failed", listenerError);
        }
      });
    }

    return Promise.reject(error);
  },
);

export default apiClient;
