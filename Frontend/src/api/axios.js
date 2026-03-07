import axios from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from '../store/authSlice';

// axios setup
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
    }
});

// attach bearer token + handle formdata
api.interceptors.request.use(
    (config) => {
        // attach token from localstorage
        const token = getAccessToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // formdata handles its own content-type, everything else is json
        if (!(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor (Auto Token Refresh + Error Handler)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => {
        // unwrap the nested data from our ApiResponse
        return response.data?.data || response.data;
    },
    async (error) => {
        // pull error message from backend
        const errorResponse = error.response?.data;
        const errorMessage = errorResponse?.message || "Something went wrong";
        const fieldErrors = errorResponse?.errors || [];
        const originalRequest = error.config;

        // Handle 401 Unauthorized - Try Token Refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (originalRequest.url?.includes('/users/refresh-token')) {
                // Refresh token itself expired - logout user
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.dispatchEvent(new Event("auth:unauthorized"));
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // refresh already in progress, queue this one
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        // retry with updated token
                        originalRequest.headers['Authorization'] = `Bearer ${getAccessToken()}`;
                        return api(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // send refresh token in body (chrome blocks cross-origin cookies)
                const refreshToken = getRefreshToken();
                const refreshResponse = await axios.post(
                    `${api.defaults.baseURL}/users/refresh-token`,
                    { refreshToken },
                    { withCredentials: true }
                );

                // save new tokens
                const newData = refreshResponse.data?.data || refreshResponse.data;
                if (newData?.accessToken) setAccessToken(newData.accessToken);
                if (newData?.refreshToken) setRefreshToken(newData.refreshToken);

                // refresh worked, replay queued requests
                processQueue(null);
                isRefreshing = false;

                // Retry the original request with the new token
                originalRequest.headers['Authorization'] = `Bearer ${newData.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // refresh failed, kick user out
                processQueue(refreshError, null);
                isRefreshing = false;
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.dispatchEvent(new Event("auth:unauthorized"));
                return Promise.reject(refreshError);
            }
        }

        // wrap error for the UI
        const customError = new Error(errorMessage);
        customError.statusCode = errorResponse?.statusCode || 500;
        customError.fieldErrors = fieldErrors;

        return Promise.reject(customError);
    }
);

export default api;
