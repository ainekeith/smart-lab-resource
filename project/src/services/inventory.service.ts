import api from './api';
import { InventoryItem, StockMovement } from '../types';

export const inventoryService = {
  getAll: async (filters?: any): Promise<{ data: InventoryItem[], total: number }> => {
    const response = await api.get('/inventory/', { params: filters });
    return {
      data: response.data.results,
      total: response.data.count
    };
  },
  
  getById: async (id: number): Promise<InventoryItem> => {
    const response = await api.get(`/inventory/${id}/`);
    return response.data;
  },
  
  create: async (inventoryData: Partial<InventoryItem>): Promise<InventoryItem> => {
    const response = await api.post('/inventory/', inventoryData);
    return response.data;
  },
  
  update: async (id: number, inventoryData: Partial<InventoryItem>): Promise<InventoryItem> => {
    const response = await api.put(`/inventory/${id}/`, inventoryData);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/inventory/${id}/`);
  },
  
  getStockMovements: async (inventoryId: number): Promise<StockMovement[]> => {
    const response = await api.get(`/inventory/${inventoryId}/stock-movements/`);
    return response.data.results;
  },
  
  addStockMovement: async (data: Partial<StockMovement>): Promise<StockMovement> => {
    const response = await api.post('/stock-movements/', data);
    return response.data;
  },
  
  getLowStockItems: async (): Promise<InventoryItem[]> => {
    const response = await api.get('/inventory/', { params: { low_stock: true } });
    return response.data.results;
  }
};

export default inventoryService;