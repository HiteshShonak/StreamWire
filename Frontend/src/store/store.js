import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

const store = configureStore({
  reducer: {
    // Auth Slice: Handles User Identity & Stealth Mode
    auth: authReducer,

    // Future Slices:
    // ui: uiReducer (Sidebar toggle, Theme)
    // player: playerReducer (Video progress, Volume)
  },
  // Middleware: This disables warnings for complex non-serializable data
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;