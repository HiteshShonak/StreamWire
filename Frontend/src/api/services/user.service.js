import api from '../axios';

export const userService = {
    // 🔎 SEARCH USERS
    searchUsers: async (params) => {
        // params: { query, page, limit }
        return await api.get('/users/search', { params });
    },

    // 👤 GET USER CHANNEL PROFILE
    getUserChannelProfile: async (username) => {
        return await api.get(`/users/c/${username}`);
    },

    // 🔑 GET CURRENT USER
    getCurrentUser: async () => {
        return await api.get('/users/me');
    },

    // 👥 UPDATE PROFILE
    updateProfile: async (formData) => {
        // formData: fullName, bio, avatar (optional), coverImage (optional)
        return await api.patch('/users/update-profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    // 🔐 CHANGE PASSWORD
    changePassword: async (data) => {
        // data: { oldPassword, newPassword, confirmPassword }
        return await api.patch('/users/change-password', data);
    },

    // 🔒 UPDATE PRIVACY SETTINGS
    updatePrivacySettings: async (data) => {
        // data: { isProfilePublic, isIdentityCloaked }
        return await api.patch('/users/toggle-privacy', data);
    },

    // ❌ DEACTIVATE ACCOUNT
    deactivateAccount: async () => {
        return await api.patch('/users/deactivate');
    }
};
