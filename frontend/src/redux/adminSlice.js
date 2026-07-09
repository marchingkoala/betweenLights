import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const initialState = {
  soldProducts: [],
  view: 'summary', // 'summary' | 'details'
  loading: false,
  error: null,
  lastFetchedAt: null,
};

export const fetchSoldProducts = createAsyncThunk(
  'admin/fetchSoldProducts',
  async ({ view = 'summary', token }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/sold-products`, {
        params: { view },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { data: res.data, view };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || 'Failed to load sold products'
      );
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminData: (state) => {
      state.soldProducts = [];
      state.error = null;
      state.lastFetchedAt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSoldProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSoldProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.soldProducts = action.payload.data;
        state.view = action.payload.view;
        state.lastFetchedAt = new Date().toISOString();
      })
      .addCase(fetchSoldProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminData } = adminSlice.actions;
export default adminSlice.reducer;
