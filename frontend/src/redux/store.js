import { configureStore, combineReducers } from '@reduxjs/toolkit';
import productsReducer from './productsSlice';
import favoritesReducer from './favoritesSlice';
import cartReducer from './cartSlice';
import authReducer from './authSlice';

import {
  persistStore,
  persistReducer,
  createMigrate,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import storage from 'redux-persist/lib/storage';

const migrations = {
  1: (state) => {
    if (!state) return Promise.resolve(state);
    const { auth } = state;
    if (auth?.user && !auth.token) {
      return Promise.resolve({
        ...state,
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        },
      });
    }
    return Promise.resolve(state);
  },
};

const rootReducer = combineReducers({
  products: productsReducer,
  favorites: favoritesReducer,
  cart: cartReducer,
  auth: authReducer,
});

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  migrate: createMigrate(migrations, { debug: false }),
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
