import api from './api';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/token/', credentials);
    
    // Save tokens and user info in localStorage
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  },
  
  register: async (userData: RegisterRequest): Promise<any> => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },
  
  logout: (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
  
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('access_token');
    return !!token;
  }
};

export default authService;