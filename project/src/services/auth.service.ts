import api from './api';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../types';
import { jwtDecode } from 'jwt-decode';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/token/', credentials);
    
    // Decode token to get user info
    const decodedToken: any = jwtDecode(response.data.access);
    const user = {
      ...response.data.user,
      // Ensure user_type is correctly set from token
      user_type: decodedToken.user_type || response.data.user.user_type,
    };
    
    // Save tokens and user info in localStorage
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return {
      ...response.data,
      user,
    };
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
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      
      const user = JSON.parse(userStr);
      
      // Verify token and user type
      const token = localStorage.getItem('access_token');
      if (token) {
        const decodedToken: any = jwtDecode(token);
        // Update user type from token if it exists
        if (decodedToken.user_type) {
          user.user_type = decodedToken.user_type;
        }
      }
      
      return user;
    } catch (error) {
      // If there's an error parsing the JSON or token, clear the invalid data
      console.error('Error getting current user:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return null;
    }
  },
  
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    
    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp > currentTime;
    } catch {
      return false;
    }
  },
  
  refreshToken: async (): Promise<string> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await api.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    
    localStorage.setItem('access_token', response.data.access);
    return response.data.access;
  },
};

export default authService;