import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
// Phase 6+ will add: problemReducer, battleReducer, leaderboardReducer, etc.

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // socket/battle state (Phase 9) will carry non-serializable refs
    }),
  devTools: import.meta.env.MODE !== "production",
});

export default store;
