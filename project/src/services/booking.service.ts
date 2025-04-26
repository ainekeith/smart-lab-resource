import api from './api';
import { Booking, BookingRequest } from '../types';

export const bookingService = {
  getAll: async (filters?: any): Promise<{ data: Booking[], total: number }> => {
    const response = await api.get('/bookings/', { params: filters });
    return {
      data: response.data.results,
      total: response.data.count
    };
  },
  
  getById: async (id: number): Promise<Booking> => {
    const response = await api.get(`/bookings/${id}/`);
    return response.data;
  },
  
  create: async (bookingData: BookingRequest): Promise<Booking> => {
    const response = await api.post('/bookings/', bookingData);
    return response.data;
  },
  
  update: async (id: number, bookingData: Partial<BookingRequest>): Promise<Booking> => {
    const response = await api.put(`/bookings/${id}/`, bookingData);
    return response.data;
  },
  
  approve: async (id: number): Promise<Booking> => {
    const response = await api.post(`/bookings/${id}/approve/`);
    return response.data;
  },
  
  reject: async (id: number, reason: string): Promise<Booking> => {
    const response = await api.post(`/bookings/${id}/reject/`, { reason });
    return response.data;
  },
  
  cancel: async (id: number): Promise<Booking> => {
    const response = await api.post(`/bookings/${id}/cancel/`);
    return response.data;
  },
  
  checkAvailability: async (equipmentId: number, startTime: string, endTime: string): Promise<boolean> => {
    const response = await api.get('/bookings/check-availability/', {
      params: { equipment_id: equipmentId, start_time: startTime, end_time: endTime }
    });
    return response.data.available;
  }
};

export default bookingService;