import api from './api';
import { InventoryItem, StockMovement, PaginatedResponse } from '../types';

class InventoryService {
  async getAll(filters?: any): Promise<PaginatedResponse<InventoryItem>> {
    try {
      const response = await api.get<PaginatedResponse<InventoryItem>>('/inventory/', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<InventoryItem> {
    try {
      const response = await api.get<InventoryItem>(`/inventory/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      throw error;
    }
  }

  async create(data: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      const response = await api.post<InventoryItem>('/inventory/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }
  }

  async update(id: number, data: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      const response = await api.put<InventoryItem>(`/inventory/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/inventory/${id}/`);
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  }

  async getStockMovements(inventoryId: number): Promise<PaginatedResponse<StockMovement>> {
    try {
      const response = await api.get<PaginatedResponse<StockMovement>>(
        '/inventory/movements/',
        { params: { inventory_id: inventoryId } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      throw error;
    }
  }

  async addStockMovement(data: Partial<StockMovement>): Promise<StockMovement> {
    try {
      const response = await api.post<StockMovement>('/inventory/movements/', data);
      return response.data;
    } catch (error) {
      console.error('Error adding stock movement:', error);
      throw error;
    }
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    try {
      const response = await api.get<PaginatedResponse<InventoryItem>>('/inventory/', {
        params: { low_stock: true }
      });
      return response.data.results;
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      throw error;
    }
  }
}

export const inventoryService = new InventoryService();
export default inventoryService;