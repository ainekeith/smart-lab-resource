import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// API endpoints
const API_URL = "/api/equipment";

// Async thunks
export const fetchEquipment = createAsyncThunk(
  "equipment/fetchEquipment",
  async ({ search, category, location, sort } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category && category !== "All") params.append("category", category);
      if (location && location !== "All") params.append("location", location);
      if (sort) params.append("sort", sort);

      const response = await axios.get(`${API_URL}?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch equipment"
      );
    }
  }
);

export const fetchEquipmentById = createAsyncThunk(
  "equipment/fetchEquipmentById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch equipment details"
      );
    }
  }
);

export const addEquipment = createAsyncThunk(
  "equipment/addEquipment",
  async (equipmentData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, equipmentData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add equipment"
      );
    }
  }
);

export const updateEquipment = createAsyncThunk(
  "equipment/updateEquipment",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update equipment"
      );
    }
  }
);

export const deleteEquipment = createAsyncThunk(
  "equipment/deleteEquipment",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete equipment"
      );
    }
  }
);

export const bookEquipment = createAsyncThunk(
  "equipment/bookEquipment",
  async ({ equipmentId, bookingData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/${equipmentId}/book`,
        bookingData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to book equipment"
      );
    }
  }
);

export const reportIssue = createAsyncThunk(
  "equipment/reportIssue",
  async ({ equipmentId, issueData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/${equipmentId}/issues`,
        issueData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to report issue"
      );
    }
  }
);

const initialState = {
  equipment: [],
  selectedEquipment: null,
  loading: false,
  error: null,
  success: false,
};

const equipmentSlice = createSlice({
  name: "equipment",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch equipment list
      .addCase(fetchEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.equipment = action.payload;
      })
      .addCase(fetchEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single equipment
      .addCase(fetchEquipmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEquipmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEquipment = action.payload;
      })
      .addCase(fetchEquipmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add equipment
      .addCase(addEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.equipment.push(action.payload);
        state.success = true;
      })
      .addCase(addEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update equipment
      .addCase(updateEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.equipment = state.equipment.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
        state.selectedEquipment = action.payload;
        state.success = true;
      })
      .addCase(updateEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete equipment
      .addCase(deleteEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.equipment = state.equipment.filter(
          (item) => item.id !== action.payload
        );
        state.success = true;
      })
      .addCase(deleteEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Book equipment
      .addCase(bookEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEquipment = action.payload;
        state.success = true;
      })
      .addCase(bookEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Report issue
      .addCase(reportIssue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reportIssue.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEquipment = action.payload;
        state.success = true;
      })
      .addCase(reportIssue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = equipmentSlice.actions;
export default equipmentSlice.reducer;
