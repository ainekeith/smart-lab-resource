import axios from "axios";

const API_URL = "http://192.168.1.131:8000/api";

// Configure axios defaults
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.withCredentials = true;

const authService = {
  login: async (credentials) => {
    try {
      console.log("Attempting login with:", credentials);
      const response = await axios.post(`${API_URL}/auth/token/`, credentials, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      console.log("Login response:", response.data);
      if (response.data.access) {
        // Decode the JWT token to get user information
        const tokenPayload = JSON.parse(
          atob(response.data.access.split(".")[1])
        );
        const userData = {
          ...response.data,
          user_type: tokenPayload.user_type,
          username: tokenPayload.username,
          email: tokenPayload.email,
          is_staff: tokenPayload.is_staff,
        };
        localStorage.setItem("user", JSON.stringify(userData));
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
      const response = await axios.post(`${API_URL}/auth/register/`, userData, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
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
