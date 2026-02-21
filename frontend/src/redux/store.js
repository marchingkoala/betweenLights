import { configureStore, combineReducers } from '@reduxjs/toolkit';
import productsReducer from './productsSlice';
import favoritesReducer from './favoritesSlice';
import cartReducer from './cartSlice';
import authReducer from './authSlice';

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import storage from 'redux-persist/lib/storage';

const rootReducer = combineReducers({
  products: productsReducer,
  favorites: favoritesReducer,
  cart: cartReducer,
  auth: authReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['products', 'favorites', 'cart', 'auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
// export const store = configureStore({
//   reducer: {
//     products: productsReducer,
//     favorites: favoritesReducer,
//     cart: cartReducer,
//     auth: authReducer,
//   },
// });
