import api from '../axios';

export const userService = {
    // Search users
    searchUsers: async (params) => {
        // params: { query, page, limit }
        return await api.get('/users/search', { params });
    },

    // Get user channel profile
    getUserChannelProfile: async (username) => {
        return await api.get(`/users/c/${username}`);
    },

    // Get current user
    getCurrentUser: async () => {
        return await api.get('/users/me');
    },

    // Update profile
    updateProfile: async (formData) => {
        // formData: fullName, bio, avatar (optional), coverImage (optional)
        return await api.patch('/users/update-profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    // Change password
    changePassword: async (data) => {
        // data: { oldPassword, newPassword, confirmPassword }
        return await api.patch('/users/change-password', data);
    },

    // Update privacy settings
    updatePrivacySettings: async (data) => {
        // data: { isProfilePublic, isIdentityCloaked }
        return await api.patch('/users/toggle-privacy', data);
    },

    // Deactivate account
    deactivateAccount: async () => {
        return await api.patch('/users/deactivate');
    }
};
