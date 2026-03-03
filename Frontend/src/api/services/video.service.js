import api from '../axios';

export const videoService = {
    // --- Public Views ---
    getAllVideos: async (params) => {
        // params: { page, limit, query, sortBy, sortType, userId }
        return await api.get('/videos', { params });
    },

    getVideoById: async (videoId) => {
        return await api.get(`/videos/v/${videoId}`);
    },

    // Trending Videos - sorted by trendScore
    getTrendingVideos: async (params = {}) => {
        return await api.get('/videos', {
            params: {
                limit: params.limit || 20,
                sortBy: 'trendScore',
                sortType: 'desc',
                ...params
            }
        });
    },

    // --- Creator Tools ---
    publishVideo: async (formData, onUploadProgress) => {
        // formData: videoFile, thumbnail, title, description, isStealthMode, tags
        return await api.post('/videos/publish', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 30 * 60 * 1000, // 30 minutes timeout for large video uploads (up to 2GB)
            onUploadProgress
        });
    },

    updateVideo: async (videoId, formData) => {
        // formData: title, description, isStealthMode, tags, thumbnail (optional)
        return await api.patch(`/videos/v/${videoId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    deleteVideo: async (videoId) => {
        return await api.delete(`/videos/v/${videoId}`);
    },

    togglePublishStatus: async (videoId) => {
        return await api.patch(`/videos/toggle/publish/${videoId}`);
    },

    // --- AI Features ---
    summarizeVideo: async (videoId) => {
        return await api.post(`/videos/v/${videoId}/summarize`);
    },

    askVideoQuestion: async (videoId, question, conversationHistory = []) => {
        return await api.post(`/videos/v/${videoId}/ask`, {
            question,
            conversationHistory
        });
    },

    // For You Feed
    getForYouFeed: async (params) => {
        // params: { page, limit }
        return await api.get('/users/feed/for-you', { params });
    },

    // Feed Management
    getFeedPreferences: async () => {
        return await api.get('/users/feed/preferences');
    },

    updateFeedPreferences: async (tags) => {
        return await api.patch('/users/feed/preferences', { tags });
    },

    buildFeed: async () => {
        return await api.post('/users/feed/build');
    },

    getAllTags: async () => {
        return await api.get('/users/feed/tags');
    },

    getPopularTags: async (limit = 50) => {
        return await api.get('/users/feed/tags/popular', { params: { limit } });
    }
};