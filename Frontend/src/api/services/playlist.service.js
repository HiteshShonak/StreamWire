import api from '../axios';

export const playlistService = {
    // --- Public ---
    getUserPlaylists: async (userId) => {
        return await api.get(`/playlists/user/${userId}`);
    },

    getPlaylistById: async (playlistId) => {
        return await api.get(`/playlists/${playlistId}`);
    },

    // --- Management ---
    createPlaylist: async (data) => {
        // data: { name, description, isPublic, isStealthMode }
        return await api.post('/playlists', data);
    },

    updatePlaylist: async (playlistId, data) => {
        return await api.patch(`/playlists/${playlistId}`, data);
    },

    deletePlaylist: async (playlistId) => {
        return await api.delete(`/playlists/${playlistId}`);
    },

    addVideoToPlaylist: async (videoId, playlistId) => {
        return await api.patch(`/playlists/add/${videoId}/${playlistId}`);
    },

    removeVideoFromPlaylist: async (videoId, playlistId) => {
        return await api.patch(`/playlists/remove/${videoId}/${playlistId}`);
    },

    // --- Library Interaction ---
    toggleSavePlaylist: async (playlistId) => {
        // Saves someone else's playlist to your library
        return await api.post(`/playlists/save/${playlistId}`);
    }
};