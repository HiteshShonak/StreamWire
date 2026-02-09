import axios from 'axios';

// 1. Create the instance
const api = axios.create({
    // Use the environment variable, but fallback to your local server for dev
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    withCredentials: true, // 🚨 CRITICAL: Matches backend 'cors({ credentials: true })'
    headers: {
        'Accept': 'application/json',
    }
});

// 1. Request Interceptor (Handle FormData properly)
api.interceptors.request.use(
    (config) => {
        // If the data is FormData, let axios set the Content-Type with boundary automatically
        // Otherwise, set it to application/json
        if (!(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 2. Response Interceptor (Auto Token Refresh + Error Handler)
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
        // Success: Your backend wraps data in a 'data' field inside ApiResponse
        // Format: { statusCode: 200, data: {...}, message: "..." }
        return response.data?.data || response.data;
    },
    async (error) => {
        // Extract the specific error message from your backend's global error handler
        // Backend returns: { success: false, statusCode: 4xx, message: "...", errors: [] }
        const errorResponse = error.response?.data;
        const errorMessage = errorResponse?.message || "Something went wrong";
        const fieldErrors = errorResponse?.errors || [];
        const originalRequest = error.config;

        // 🔄 Handle 401 Unauthorized - Try Token Refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Prevent refresh-token endpoint from triggering infinite loop
            if (originalRequest.url?.includes('/users/refresh-token')) {
                // Refresh token itself expired - logout user
                window.dispatchEvent(new Event("auth:unauthorized"));
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Token refresh already in progress - queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        return api(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Hit refresh token endpoint (cookies sent automatically via withCredentials)
                await axios.post(
                    `${api.defaults.baseURL}/users/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                // Token refreshed successfully - process queued requests
                processQueue(null);
                isRefreshing = false;

                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed - logout user
                processQueue(refreshError, null);
                isRefreshing = false;
                window.dispatchEvent(new Event("auth:unauthorized"));
                return Promise.reject(refreshError);
            }
        }

        // Create a custom error object to pass to the UI
        const customError = new Error(errorMessage);
        customError.statusCode = errorResponse?.statusCode || 500;
        customError.fieldErrors = fieldErrors; // Attach validation errors (e.g., for forms)
        
        return Promise.reject(customError);
    }
);

export default api;