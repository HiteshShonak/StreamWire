import api from '../axios';

export const tweetService = {
    // Get feed
    getAllTweets: async (params) => {
        return await api.get('/tweets', { params });
    },

    // Get single tweet
    getTweetById: async (tweetId) => {
        return await api.get(`/tweets/${tweetId}`);
    },

    // Get profile feed
    getUserTweets: async (userId, params) => {
        return await api.get(`/tweets/user/${userId}`, { params });
    },

    // Trending Tweets - sorted by trendScore
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

    // Create tweet / drop
    createTweet: async (formData) => {
        // Fix: Do not manually set 'Content-Type': 'multipart/form-data'
        // Axios detects FormData and sets the correct header with the boundary automatically.
        return await api.post('/tweets', formData);
    },

    // Update tweet
    updateTweet: async (tweetId, data) => {
        return await api.patch(`/tweets/${tweetId}`, data);
    },

    // Delete tweet
    deleteTweet: async (tweetId) => {
        return await api.delete(`/tweets/${tweetId}`);
    },

    // Vote
    voteOnPoll: async (tweetId, optionIndex) => {
        return await api.post(`/tweets/vote/${tweetId}`, { optionIndex });
    }
};