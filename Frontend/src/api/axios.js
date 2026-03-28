import axios from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from '../store/authSlice';

const AUTH_ROUTES_SKIP_REFRESH = [
    '/users/login',
    '/users/register-request',
    '/users/verify-otp',
    '/users/resend-otp',
    '/users/forgot-password',
    '/users/reset-password',
    '/users/refresh-token'
];

const isAuthRoute = (url = '') => AUTH_ROUTES_SKIP_REFRESH.some((route) => String(url).includes(route));

const buildCustomError = (errorResponse, fallback = {}) => {
    const customError = new Error(
        errorResponse?.message || fallback.message || 'Something went wrong'
    );

    customError.statusCode =
        Number(errorResponse?.statusCode) ||
        Number(fallback.statusCode) ||
        0;

    customError.fieldErrors = errorResponse?.errors || fallback.fieldErrors || [];
    return customError;
};

// Axios setup.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
    }
});

// Add auth headers and JSON defaults.
api.interceptors.request.use(
    (config) => {
        // Add the access token.
        const token = getAccessToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Let FormData set its own content type.
        if (!(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Refresh auth and normalize API errors.
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
        // Read the backend error.
        const errorResponse = error.response?.data;
        const originalRequest = error.config;
        const status = error.response?.status;
        const originalUrl = originalRequest?.url || '';
        const skipRefresh = isAuthRoute(originalUrl);

        // Try token refresh on 401s.
        if (status === 401 && originalRequest && !originalRequest._retry && !skipRefresh) {
            const refreshToken = getRefreshToken();

            // No refresh token means we stop here.
            if (!refreshToken) {
                const customError = buildCustomError(errorResponse, {
                    statusCode: status,
                    message: error?.message,
                });
                return Promise.reject(customError);
            }

            if (isRefreshing) {
                // Wait for the active refresh.
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        // Retry with the new token.
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
                // Send the refresh token in the body.
                const refreshResponse = await axios.post(
                    `${api.defaults.baseURL}/users/refresh-token`,
                    { refreshToken },
                    { withCredentials: true }
                );

                // Save the new tokens.
                const newData = refreshResponse.data?.data || refreshResponse.data;
                if (newData?.accessToken) setAccessToken(newData.accessToken);
                if (newData?.refreshToken) setRefreshToken(newData.refreshToken);

                // Replay queued requests.
                processQueue(null);
                isRefreshing = false;

                // Retry the original request.
                originalRequest.headers['Authorization'] = `Bearer ${newData.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, sign the user out.
                processQueue(refreshError, null);
                isRefreshing = false;
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.dispatchEvent(new Event("auth:unauthorized"));
                const refreshErrorResponse = refreshError?.response?.data;
                return Promise.reject(
                    buildCustomError(refreshErrorResponse, {
                        statusCode: refreshError?.response?.status,
                        message: refreshError?.message,
                    })
                );
            }
        }

        // Return a normalized error.
        const customError = buildCustomError(errorResponse, {
            statusCode: status,
            message: error?.message,
        });
        return Promise.reject(customError);
    }
);

export default api;
