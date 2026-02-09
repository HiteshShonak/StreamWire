import api from '../axios';

export const subscriptionService = {
    // --- Actions ---
    toggleSubscription: async (channelId) => {
        // Handles Subscribe, Unsubscribe, and Request Access
        return await api.post(`/subscriptions/c/${channelId}`);
    },

    // --- Lists ---
    getUserSubscribers: async (channelId) => {
        // The "Fans" list
        return await api.get(`/subscriptions/c/${channelId}`);
    },

    getSubscribedChannels: async (subscriberId) => {
        // The "Following" list
        return await api.get(`/subscriptions/u/${subscriberId}`);
    },

    // --- Private Channel Management ---
    getPendingRequests: async () => {
        return await api.get('/subscriptions/requests');
    },

    manageRequest: async (requestId, action) => {
        // action: "ACCEPT" or "REJECT"
        return await api.patch(`/subscriptions/requests/${requestId}`, { action });
    }
};