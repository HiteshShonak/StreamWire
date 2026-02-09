import api from '../axios';

export const commentService = {
    getVideoComments: async (videoId, params) => {
        // params: { page, limit, sortBy, sortType }
        return await api.get(`/comments/v/${videoId}`, { params });
    },

    addComment: async (videoId, content, isStealthMode) => {
        return await api.post(`/comments/v/${videoId}`, { content, isStealthMode });
    },

    updateComment: async (commentId, content, isStealthMode) => {
        return await api.patch(`/comments/c/${commentId}`, { content, isStealthMode });
    },

    deleteComment: async (commentId) => {
        return await api.delete(`/comments/c/${commentId}`);
    },

    // Pinned Comments
    getPinnedComments: async (videoId) => {
        return await api.get(`/comments/v/${videoId}/pinned`);
    },

    togglePinComment: async (videoId, commentId) => {
        return await api.post(`/comments/v/${videoId}/pin/${commentId}`);
    },

    // Tweet/Wire Comments
    getTweetComments: async (tweetId, params) => {
        // params: { page, limit, sortBy, sortType }
        return await api.get(`/comments/t/${tweetId}`, { params });
    },

    addTweetComment: async (tweetId, content, isStealthMode) => {
        return await api.post(`/comments/t/${tweetId}`, { content, isStealthMode });
    }
};