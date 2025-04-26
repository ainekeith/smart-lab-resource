export interface LoginResponse {
  access: string; // JWT access token
  refresh: string; // JWT refresh token
  user: User; // User object
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  user_type: "student" | "staff" | "admin";
  department?: string;
  phone_number?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: "student" | "staff" | "admin";
  department?: string;
  phone_number?: string;
}

export interface ErrorResponse {
  detail: string;
  [key: string]: any;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
