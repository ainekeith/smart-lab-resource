import axios from "axios";

const API_URL = "http://192.168.1.131:8000/api";

const authService = {
  login: async (credentials) => {
    try {
      console.log("Attempting login with:", credentials);
      console.log("Login URL:", `${API_URL}/auth/token/`);
      const response = await axios.post(`${API_URL}/auth/token/`, credentials, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: true,
      });
      console.log("Login response:", response.data);
      if (response.data.access) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      console.error("Login error details:", error);
      throw (
        error.response?.data || { message: "An error occurred during login" }
      );
    }
  },

  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register/`, userData);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "An error occurred during registration",
        }
      );
    }
  },

  logout: () => {
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  getAuthHeader: () => {
    const user = authService.getCurrentUser();
    if (user && user.access) {
      return { Authorization: `Bearer ${user.access}` };
    }
    return {};
  },

  updateToken: (newAccessToken) => {
    const user = authService.getCurrentUser();
    if (user) {
      user.access = newAccessToken;
      localStorage.setItem("user", JSON.stringify(user));
    }
  },
};

export default authService;
