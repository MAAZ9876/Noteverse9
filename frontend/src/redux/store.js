import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./userRedux";
import {
  persistStore,
  persistReducer,
  createTransform,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

// Only the login (user + token) is saved in localStorage. Transient flags such as isFetching/error
// used to be saved too, which could leave the login button disabled forever after a reload.
const userTransform = createTransform(
  (inbound) => ({ currentUser: inbound.currentUser, token: inbound.token }),
  (outbound) => {
    // sessions saved by the old version have no token -> force a fresh login
    const loggedIn = !!(outbound && outbound.token && outbound.currentUser);
    return {
      currentUser: loggedIn ? outbound.currentUser : null,
      token: loggedIn ? outbound.token : null,
      isFetching: false,
      error: null,
      searchedValue: null,
    };
  },
  { whitelist: ["user"] }
);

const persistConfig = {
  key: "noteverse-root",
  version: 2,
  storage,
  transforms: [userTransform],
};

const rootReducer = combineReducers({ user: userReducer });

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
