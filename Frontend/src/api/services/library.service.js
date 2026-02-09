import api from '../axios';

export const libraryService = {
    getHistory: async (params) => {
        return await api.get('/library/history', { params });
    },

    getWatchLater: async (params) => {
        return await api.get('/library/watch-later', { params });
    },

    toggleWatchLater: async (videoId) => {
        return await api.post(`/library/watch-later/${videoId}`);
    },

    checkWatchLater: async (videoId) => {
        return await api.get(`/library/watch-later/${videoId}`);
    },

    getLikedVideos: async (params) => {
        return await api.get('/library/liked-videos', { params });
    },

    getSavedPlaylists: async (params) => {
        return await api.get('/library/playlists', { params });
    }
};