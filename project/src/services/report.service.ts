import api from './api';
import { DashboardStats, PaginatedResponse } from '../types';

class ReportService {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/reports/dashboard_stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  async getEquipmentUsageReport(startDate?: string, endDate?: string): Promise<any> {
    try {
      const response = await api.get('/reports/equipment-usage/', {
        params: { start_date: startDate, end_date: endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching equipment usage report:', error);
      throw error;
    }
  }

  async getInventoryStatusReport(startDate?: string, endDate?: string): Promise<any> {
    try {
      const response = await api.get('/reports/inventory-status/', {
        params: { start_date: startDate, end_date: endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory status report:', error);
      throw error;
    }
  }

  async getMaintenanceReport(startDate?: string, endDate?: string): Promise<any> {
    try {
      const response = await api.get('/reports/maintenance/', {
        params: { start_date: startDate, end_date: endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching maintenance report:', error);
      throw error;
    }
  }

  async getBookingAnalytics(startDate?: string, endDate?: string): Promise<any> {
    try {
      const response = await api.get('/reports/booking-analytics/', {
        params: { start_date: startDate, end_date: endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching booking analytics:', error);
      throw error;
    }
  }

  async getAllReports(filters?: any): Promise<PaginatedResponse<any>> {
    try {
      const response = await api.get('/reports/', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  }

  async getReportById(id: number): Promise<any> {
    try {
      const response = await api.get(`/reports/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  }

  async generateReport(type: string, params: any): Promise<any> {
    try {
      const response = await api.post('/reports/generate/', {
        report_type: type,
        parameters: params,
      });
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  async exportReport(reportType: string, format: 'pdf' | 'csv', filters: any): Promise<Blob> {
    try {
      const response = await api.get(`/reports/${reportType}/export/`, {
        params: { ...filters, format },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }
}

export const reportService = new ReportService();
export default reportService;