import axios from 'axios';

// axios setup
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    withCredentials: true, // Important: matches backend 'cors({ credentials: true })'
    headers: {
        'Accept': 'application/json',
    }
});

// Request interceptor (handle FormData properly)
api.interceptors.request.use(
    (config) => {
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
                window.dispatchEvent(new Event("auth:unauthorized"));
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // refresh already in progress, queue this one
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
                // try refreshing the token
                await axios.post(
                    `${api.defaults.baseURL}/users/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                // refresh worked, replay queued requests
                processQueue(null);
                isRefreshing = false;

                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // refresh failed, kick user out
                processQueue(refreshError, null);
                isRefreshing = false;
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