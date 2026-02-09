import { createSlice } from "@reduxjs/toolkit";

const loadStateFromStorage = () => {
    try {
        const authStatus = localStorage.getItem("authStatus");
        const userData = localStorage.getItem("userData");

        if (authStatus === "true" && userData) {
            return {
                status: true,
                userData: JSON.parse(userData),
                loading: false,
            };
        }
    } catch (error) {
        console.error("Failed to load auth state from local storage", error);
    }
    return {
        status: false,
        userData: null,
        loading: true,
    };
};

const initialState = loadStateFromStorage();

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state.status = true;
            state.userData = action.payload; 
            state.loading = false;
            
            localStorage.setItem("authStatus", "true");
            localStorage.setItem("userData", JSON.stringify(action.payload));
        },

        logout: (state) => {
            state.status = false;
            state.userData = null;
            state.loading = false;
            
            localStorage.removeItem("authStatus");
            localStorage.removeItem("userData");
        },

        setLoading: (state, action) => {
            state.loading = action.payload;
        },

        
        updateIdentity: (state, action) => {
            if (state.userData) {
                state.userData = { ...state.userData, ...action.payload };
                localStorage.setItem("userData", JSON.stringify(state.userData));
            }
        },

        updateProfile: (state, action) => {
            if (state.userData) {
                state.userData = { ...state.userData, ...action.payload };
                localStorage.setItem("userData", JSON.stringify(state.userData));
            }
        }
    }
});

export const { login, logout, setLoading, updateIdentity, updateProfile } = authSlice.actions;

export default authSlice.reducer;