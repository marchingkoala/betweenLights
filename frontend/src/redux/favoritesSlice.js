import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // array of product IDs
};

export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setFavorites: (state, action) => {
      state.items = action.payload;
    },
    addFavorite: (state, action) => {
      if (!state.items.includes(action.payload))
        state.items.push(action.payload);
    },
    removeFavorite: (state, action) => {
      state.items = state.items.filter((id) => id !== action.payload);
    },
  },
});

export const { setFavorites, addFavorite, removeFavorite } =
  favoritesSlice.actions;
export default favoritesSlice.reducer;
