import api from './api';
import { Equipment, MaintenanceRecord, PaginatedResponse } from '../types';

class EquipmentService {
  async getAll(filters?: any): Promise<PaginatedResponse<Equipment>> {
    try {
      const response = await api.get<PaginatedResponse<Equipment>>('/equipment/', { params: filters });
      console.log('Equipment response:', response.data); // Keep for debugging
      return response.data;
    } catch (error) {
      console.error('Error fetching equipment:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<Equipment> {
    try {
      const response = await api.get<Equipment>(`/equipment/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching equipment details:', error);
      throw error;
    }
  }

  async create(equipmentData: FormData): Promise<Equipment> {
    try {
      const response = await api.post<Equipment>('/equipment/', equipmentData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating equipment:', error);
      throw error;
    }
  }

  async update(id: number, equipmentData: FormData): Promise<Equipment> {
    try {
      const response = await api.put<Equipment>(`/equipment/${id}/`, equipmentData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating equipment:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/equipment/${id}/`);
    } catch (error) {
      console.error('Error deleting equipment:', error);
      throw error;
    }
  }

  async addMaintenanceRecord(
    equipmentId: number,
    data: Partial<MaintenanceRecord>
  ): Promise<MaintenanceRecord> {
    try {
      const response = await api.post<MaintenanceRecord>(
        `/equipment/${equipmentId}/maintenance/`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error adding maintenance record:', error);
      throw error;
    }
  }

  async getMaintenanceRecords(equipmentId: number): Promise<MaintenanceRecord[]> {
    try {
      const response = await api.get<{ results: MaintenanceRecord[] }>(
        `/equipment/${equipmentId}/maintenance/`
      );
      return response.data.results;
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      throw error;
    }
  }
}

export const equipmentService = new EquipmentService();
export default equipmentService;