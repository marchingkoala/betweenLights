import { configureStore, combineReducers } from '@reduxjs/toolkit';
import productsReducer from './productsSlice';
import favoritesReducer from './favoritesSlice';
import cartReducer from './cartSlice';
import authReducer from './authSlice';
import adminReducer from './adminSlice';

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
  // `auth` (which holds the JWT) is no longer persisted to localStorage, since
  // a JS-readable token sitting in storage indefinitely is an XSS liability.
  // This strips any `auth` blob left over from before that change so an old
  // token isn't silently rehydrated on the next load.
  2: (state) => {
    if (!state) return Promise.resolve(state);
    const { auth, ...rest } = state;
    return Promise.resolve(rest);
  },
};

const rootReducer = combineReducers({
  products: productsReducer,
  favorites: favoritesReducer,
  cart: cartReducer,
  auth: authReducer,
  admin: adminReducer,
});

const persistConfig = {
  key: 'root',
  version: 2,
  storage,
  migrate: createMigrate(migrations, { debug: false }),
  // `auth` is intentionally excluded: it holds the JWT, and persisting it to
  // localStorage would leave it readable by any JS on the page (XSS risk)
  // indefinitely. Users simply re-authenticate after a refresh/new session.
  whitelist: ['products', 'favorites', 'cart'],
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
