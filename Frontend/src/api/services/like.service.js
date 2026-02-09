import api from '../axios';

export const likeService = {
    toggleVideoLike: async (videoId) => {
        return await api.post(`/likes/toggle/v/${videoId}`);
    },

    toggleCommentLike: async (commentId) => {
        return await api.post(`/likes/toggle/c/${commentId}`);
    },

    toggleTweetLike: async (tweetId) => {
        return await api.post(`/likes/toggle/t/${tweetId}`);
    }
};