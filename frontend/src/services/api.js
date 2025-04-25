import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL || "http://192.168.1.131:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post("/auth/login/", credentials),
  register: (userData) => api.post("/auth/register/", userData),
  logout: () => api.post("/auth/logout/"),
  refreshToken: () => api.post("/auth/token/refresh/"),
};

export const equipmentAPI = {
  getAll: () => api.get("/equipment/"),
  getById: (id) => api.get(`/equipment/${id}/`),
  create: (data) => api.post("/equipment/", data),
  update: (id, data) => api.put(`/equipment/${id}/`, data),
  delete: (id) => api.delete(`/equipment/${id}/`),
};

export const inventoryAPI = {
  getAll: () => api.get("/inventory/"),
  getById: (id) => api.get(`/inventory/${id}/`),
  create: (data) => api.post("/inventory/", data),
  update: (id, data) => api.put(`/inventory/${id}/`, data),
  delete: (id) => api.delete(`/inventory/${id}/`),
};

export const bookingAPI = {
  getAll: () => api.get("/bookings/"),
  getById: (id) => api.get(`/bookings/${id}/`),
  create: (data) => api.post("/bookings/", data),
  update: (id, data) => api.put(`/bookings/${id}/`, data),
  delete: (id) => api.delete(`/bookings/${id}/`),
  approve: (id) => api.post(`/bookings/${id}/approve/`),
  reject: (id) => api.post(`/bookings/${id}/reject/`),
};

export default api;
