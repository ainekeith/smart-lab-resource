import api from './api';
import { DashboardStats } from '../types';

export const reportService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/reports/dashboard_stats/');
    return response.data;
  },
  
  getEquipmentUsageReport: async (startDate?: string, endDate?: string): Promise<any> => {
    const response = await api.get('/reports/equipment-usage/', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },
  
  getInventoryStatusReport: async (startDate?: string, endDate?: string): Promise<any> => {
    const response = await api.get('/reports/inventory-status/', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },
  
  getMaintenanceReport: async (startDate?: string, endDate?: string): Promise<any> => {
    const response = await api.get('/reports/maintenance/', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },
  
  getBookingAnalytics: async (startDate?: string, endDate?: string): Promise<any> => {
    const response = await api.get('/reports/booking-analytics/', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },
  
  exportReport: async (reportType: string, format: 'pdf' | 'csv', filters: any): Promise<Blob> => {
    const response = await api.get(`/reports/${reportType}/`, {
      params: { ...filters, format },
      responseType: 'blob'
    });
    return response.data;
  }
};

export default reportService;