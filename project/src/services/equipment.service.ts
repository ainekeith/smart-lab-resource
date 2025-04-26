import api from './api';
import { Equipment, MaintenanceRecord } from '../types';

export const equipmentService = {
  getAll: async (filters?: any): Promise<{ data: Equipment[], total: number }> => {
    const response = await api.get('/equipment/', { params: filters });
    return {
      data: response.data.results,
      total: response.data.count
    };
  },
  
  getById: async (id: number): Promise<Equipment> => {
    const response = await api.get(`/equipment/${id}/`);
    return response.data;
  },
  
  create: async (equipmentData: FormData): Promise<Equipment> => {
    const response = await api.post('/equipment/', equipmentData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  update: async (id: number, equipmentData: FormData): Promise<Equipment> => {
    const response = await api.put(`/equipment/${id}/`, equipmentData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/equipment/${id}/`);
  },
  
  addMaintenanceRecord: async (
    equipmentId: number, 
    data: Partial<MaintenanceRecord>
  ): Promise<MaintenanceRecord> => {
    const response = await api.post(`/equipment/${equipmentId}/maintenance/`, data);
    return response.data;
  },
  
  getMaintenanceRecords: async (equipmentId: number): Promise<MaintenanceRecord[]> => {
    const response = await api.get(`/equipment/${equipmentId}/maintenance/`);
    return response.data.results;
  }
};

export default equipmentService;