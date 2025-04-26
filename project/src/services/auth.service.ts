import api from "./api";
import { LoginRequest, LoginResponse, RegisterRequest, User } from "../types";

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      // Update endpoint to match Django's URL pattern
      const response = await api.post<LoginResponse>(
        "/auth/token/",
        credentials
      );

      if (response.data.access && response.data.refresh) {
        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        return response.data;
      }
      throw new Error("Invalid response format");
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message);
      throw error;
    }
  },

  register: async (userData: RegisterRequest): Promise<any> => {
    try {
      // Update endpoint to match Django's URL pattern
      const response = await api.post("/auth/register/", userData);
      return response.data;
    } catch (error: any) {
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  logout: (): void => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem("access_token");
    return !!token;
  },
};

export default authService;
