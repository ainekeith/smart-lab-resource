import api from "./api";
import { DashboardStats } from "../types/dashboard";

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    try {
      const response = await api.get<DashboardStats>(
        "/api/dashboard/statistics/"
      );
      return response.data;
    } catch (error) {
      console.error("[DashboardService] Get stats error:", error);
      throw error;
    }
  }
}

export default new DashboardService();
