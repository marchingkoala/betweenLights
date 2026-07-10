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

  orders: [],
  ordersLoading: false,
  ordersError: null,
  ordersLastFetchedAt: null,
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

export const fetchOrders = createAsyncThunk(
  'admin/fetchOrders',
  async ({ token }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || 'Failed to load orders'
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

      state.orders = [];
      state.ordersError = null;
      state.ordersLastFetchedAt = null;
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
      })
      .addCase(fetchOrders.pending, (state) => {
        state.ordersLoading = true;
        state.ordersError = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.ordersLoading = false;
        state.orders = action.payload;
        state.ordersLastFetchedAt = new Date().toISOString();
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.ordersLoading = false;
        state.ordersError = action.payload;
      });
  },
});

export const { clearAdminData } = adminSlice.actions;
export default adminSlice.reducer;
