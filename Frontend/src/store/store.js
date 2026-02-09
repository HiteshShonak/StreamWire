import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

const store = configureStore({
  reducer: {
    // 🔐 Auth Slice: Handles User Identity & Stealth Mode
    auth: authReducer,
    
    // 🔮 Future Slices (We will add these later):
    // ui: uiReducer (Sidebar toggle, Theme)
    // player: playerReducer (Video progress, Volume)
  },
  // ⚙️ Middleware: This disables warnings if we store complex non-serializable data 
  // (Standard practice for larger apps to keep the console clean)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;