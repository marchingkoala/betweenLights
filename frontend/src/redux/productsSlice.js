import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  eyeglasses: [],
  sunglasses: [],
  loading: false,
  error: null,
};

export const fetchEyeglasses = createAsyncThunk(
  'products/fetchEyeglasses',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.get(
        'http://localhost:5000/api/products?category=eyeglasses'
      );
      if (res.status === 200) {
        // Use the existing action to set data into store
        dispatch(setEyeglasses(res.data));
      }
      return res.data; // optional, for extraReducers if needed
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchSunglasses = createAsyncThunk(
  'products/fetchSunglasses',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.get(
        'http://localhost:5000/api/products?category=sunglasses'
      );
      if (res.status === 200) {
        // Use the existing action to set data into store
        dispatch(setSunglasses(res.data));
      }
      return res.data; // optional
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setEyeglasses: (state, action) => {
      state.eyeglasses = action.payload;
    },
    setSunglasses: (state, action) => {
      state.sunglasses = action.payload;
    },
    addEyeglass: (state, action) => {
      state.eyeglasses.push(action.payload);
    },
    addSunglass: (state, action) => {
      state.sunglasses.push(action.payload);
    },
    updateEyeglass: (state, action) => {
      const index = state.eyeglasses.findIndex(
        (p) => p.id === action.payload.id
      );
      if (index !== -1) state.eyeglasses[index] = action.payload;
    },
    updateSunglass: (state, action) => {
      const index = state.sunglasses.findIndex(
        (p) => p.id === action.payload.id
      );
      if (index !== -1) state.sunglasses[index] = action.payload;
    },
  },
});

export const {
  setEyeglasses,
  setSunglasses,
  addEyeglass,
  addSunglass,
  updateEyeglass,
  updateSunglass,
} = productsSlice.actions;

export default productsSlice.reducer;
