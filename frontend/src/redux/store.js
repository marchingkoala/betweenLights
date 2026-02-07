import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './productsSlice';
import favoritesReducer from './favoritesSlice';
import cartReducer from './cartSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    favorites: favoritesReducer,
    cart: cartReducer,
    auth: authReducer,
  },
});
