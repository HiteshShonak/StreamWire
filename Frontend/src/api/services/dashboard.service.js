import api from '../axios';

export const dashboardService = {
    getChannelStats: async () => {
        // Returns totalViews, totalSubscribers, totalVideos, totalLikes
        return await api.get('/dashboard/stats');
    },

    getChannelVideos: async (params) => {
        // params: { page, limit, query }
        // Returns table-ready list of videos (including private/unlisted)
        return await api.get('/dashboard/videos', { params });
    }
};