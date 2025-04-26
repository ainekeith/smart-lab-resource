import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService } from "../../services/auth.service";
import {
  AuthState,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  ErrorResponse,
} from "../../types/auth.types";

// Get user from localStorage
const user = authService.getCurrentUser();
const accessToken = localStorage.getItem("access_token");
const refreshToken = localStorage.getItem("refresh_token");

const initialState: AuthState = {
  user: user,
  accessToken: accessToken,
  refreshToken: refreshToken,
  isAuthenticated: !!accessToken,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk<
  LoginResponse,
  LoginRequest,
  { rejectValue: ErrorResponse }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials);
    return response;
  } catch (error: any) {
    console.error("Login error:", error.response?.data || error);
    return rejectWithValue(error.response?.data || { detail: "Login failed" });
  }
});

export const register = createAsyncThunk<
  { message: string },
  RegisterRequest,
  { rejectValue: ErrorResponse }
>("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const response = await authService.register(userData);
    return { message: "Registration successful!" };
  } catch (error: any) {
    console.error("Registration error:", error.response?.data || error);
    return rejectWithValue(
      error.response?.data || { detail: "Registration failed" }
    );
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  authService.logout();
  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.access; // Changed from accessToken to access
        state.refreshToken = action.payload.refresh; // Changed from refreshToken to refresh
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload?.detail || "Failed to login";
      })

      // Register cases
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.detail || "Failed to register";
      })

      // Logout case
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { setCredentials, clearError } = authSlice.actions;
export default authSlice.reducer;
