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
            const { user, accessToken, refreshToken } = action.payload;

            state.status = true;
            state.userData = user;
            state.loading = false;

            localStorage.setItem("authStatus", "true");
            localStorage.setItem("userData", JSON.stringify(user));
            if (accessToken) localStorage.setItem("accessToken", accessToken);
            if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        },

        logout: (state) => {
            state.status = false;
            state.userData = null;
            state.loading = false;

            localStorage.removeItem("authStatus");
            localStorage.removeItem("userData");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
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

// token helpers (used by axios interceptor)
export const getAccessToken = () => localStorage.getItem("accessToken");
export const getRefreshToken = () => localStorage.getItem("refreshToken");
export const setAccessToken = (token) => localStorage.setItem("accessToken", token);
export const setRefreshToken = (token) => localStorage.setItem("refreshToken", token);

export const { login, logout, setLoading, updateIdentity, updateProfile } = authSlice.actions;

export default authSlice.reducer;
