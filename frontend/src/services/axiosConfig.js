import axios from "axios";
import authService from "./authService";

const API_URL =
  process.env.REACT_APP_API_URL || "http://192.168.1.131:8000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const authHeader = authService.getAuthHeader();
    if (authHeader.Authorization) {
      config.headers.Authorization = authHeader.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const user = authService.getCurrentUser();
        if (user?.refresh) {
          const response = await axios.post(
            `${API_URL}/auth/token/refresh/`,
            {
              refresh: user.refresh,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              withCredentials: true,
            }
          );

          const { access } = response.data;
          authService.updateToken(access);

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // If refresh token fails, logout the user
        authService.logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // If the error has a response, return the error message from the server
    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }

    // For network errors or other issues
    return Promise.reject({
      message: error.message || "An unexpected error occurred",
    });
  }
);

export default axiosInstance;
