import axios from "axios";
import { store } from "../store/store";

const apiClient = axios.create();

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.Storage?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default apiClient;
