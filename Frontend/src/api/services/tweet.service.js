import api from '../axios';

export const tweetService = {
    // 🌍 GET FEED
    getAllTweets: async (params) => {
        return await api.get('/tweets', { params });
    },

    // 🔎 GET SINGLE TWEET
    getTweetById: async (tweetId) => {
        return await api.get(`/tweets/${tweetId}`);
    },

    // 👤 GET PROFILE FEED
    getUserTweets: async (userId, params) => {
        return await api.get(`/tweets/user/${userId}`, { params });
    },

    // 🔥 Trending Tweets - sorted by trendScore
    getTrendingTweets: async (params = {}) => {
        return await api.get('/tweets', { 
            params: { 
                limit: params.limit || 20, 
                sortBy: 'trendScore', 
                sortType: 'desc',
                ...params 
            } 
        });
    },

    // 📝 CREATE TWEET / DROP
    createTweet: async (formData) => {
        // 🚨 FIX: Do NOT manually set 'Content-Type': 'multipart/form-data'
        // Axios detects FormData and sets the correct header with the boundary automatically.
        return await api.post('/tweets', formData);
    },

    // ✏️ UPDATE TWEET
    updateTweet: async (tweetId, data) => {
        return await api.patch(`/tweets/${tweetId}`, data);
    },

    // 🗑️ DELETE TWEET
    deleteTweet: async (tweetId) => {
        return await api.delete(`/tweets/${tweetId}`);
    },

    // 🗳️ VOTE
    voteOnPoll: async (tweetId, optionIndex) => {
        return await api.post(`/tweets/vote/${tweetId}`, { optionIndex });
    }
};