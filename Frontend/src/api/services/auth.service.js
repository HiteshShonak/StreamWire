import api from '../axios';

export const authService = {
    // --- Registration Flow ---
    registerRequest: async (data) => {
        // data: { fullName, email, username, password }
        return await api.post('/users/register-request', data);
    },

    verifyOtp: async (data) => {
        // data: { email, otp } - Backend handles user creation after verification
        return await api.post('/users/verify-otp', data);
    },

    resendOtp: async (email) => {
        return await api.post('/users/resend-otp', { email });
    },

    // --- Session Management ---
    login: async (credentials) => {
        // credentials: { identifier, password }
        return await api.post('/users/login', credentials);
    },

    logout: async () => {
        return await api.post('/users/logout');
    },

    logoutAll: async () => {
        return await api.post('/users/logout-all');
    },

    refreshToken: async () => {
        return await api.post('/users/refresh-token');
    },

    // --- Password Recovery ---
    forgotPassword: async (identifier) => {
        return await api.post('/users/forgot-password', { identifier });
    },

    resetPassword: async (data) => {
        // data: { email, otp, newPassword }
        return await api.post('/users/reset-password', data);
    },

    changePassword: async (data) => {
        // data: { oldPassword, newPassword }
        return await api.patch('/users/change-password', data);
    },

    // --- Profile & Identity ---
    getCurrentUser: async () => {
        return await api.get('/users/me');
    },

    getChannelProfile: async (username) => {
        return await api.get(`/users/c/${username}`);
    },

    getUserChannelProfile: async (username) => {
        return await api.get(`/users/c/${username}`);
    },

    updateProfile: async (formData, onUploadProgress) => {
        // formData: avatar, coverImage, fullName, bio, etc.
        // Must send 'multipart/form-data' which Axios handles automatically if passed FormData
        return await api.patch('/users/update-profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress
        });
    },

    togglePrivacy: async (settings) => {
        // settings: { isProfilePublic, isIdentityCloaked }
        return await api.patch('/users/toggle-privacy', settings);
    },

    deactivateAccount: async () => {
        return await api.patch('/users/deactivate');
    }
};