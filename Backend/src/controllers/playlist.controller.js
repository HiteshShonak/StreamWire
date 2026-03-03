import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { SavedPlaylist } from "../models/savedPlaylist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ANONYMOUS_USER_NAME } from "../constants.js";

// Create playlist
export const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, isPublic, isStealthMode } = req.body;

    if (!name?.trim()) throw new ApiError(400, "Playlist name is required");

    // Figure out stealth status (use explicit value or default to user's global cloak setting)
    let finalStealthMode = req.user.isIdentityCloaked;
    if (typeof isStealthMode !== "undefined") {
        finalStealthMode = isStealthMode === "true" || isStealthMode === true;
    }

    const playlist = await Playlist.create({
        name,
        description,
        isPublic: isPublic === "true" || isPublic === true,
        isStealthMode: finalStealthMode, // Save stealth state
        owner: req.user._id,
        videos: []
    });

    return res
        .status(201)
        .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

// Get user playlists
export const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid User ID");

    // 1. Check access level
    const isViewerOwner = req.user?._id?.toString() === userId.toString();

    const matchStage = {
        owner: new mongoose.Types.ObjectId(userId)
    };

    // If viewer is NOT owner, only show Public playlists
    if (!isViewerOwner) {
        matchStage.isPublic = true;
    }

    const pipeline = [
        { $match: matchStage },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            isIdentityCloaked: 1
                        }
                    }
                ]
            }
        },
        { $unwind: "$owner" },
        // Mask Identity: "StreamWire User" if cloaked or playlist is stealth
        {
            $addFields: {
                "owner.fullName": {
                    $cond: {
                        if: {
                            $and: [
                                {
                                    $or: [
                                        { $eq: ["$owner.isIdentityCloaked", true] },
                                        { $eq: ["$isStealthMode", true] }
                                    ]
                                },
                                // Safely compare IDs to allow owner to see their own name
                                { $ne: ["$owner._id", req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null] }
                            ]
                        },
                        then: ANONYMOUS_USER_NAME,
                        else: "$owner.fullName"
                    }
                }
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                videoCount: { $size: "$videos" },
                updatedAt: 1,
                isPublic: 1,
                isStealthMode: 1,
                owner: 1
            }
        }
    ];

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: {
            totalDocs: "totalPlaylists",
            docs: "playlists"
        }
    };

    const result = await Playlist.aggregatePaginate(Playlist.aggregate(pipeline), options);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "User playlists fetched successfully"));
});

// Get playlist by ID
export const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid Playlist ID");

    const playlistData = await Playlist.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(playlistId) } },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $match: { isPublished: true } // Filter out deleted/private videos
                    },
                    {
                        $lookup: { // Populate video owner
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                { $project: { fullName: 1, username: 1, avatar: 1, isIdentityCloaked: 1 } }
                            ]
                        }
                    },
                    { $addFields: { owner: { $first: "$owner" } } },
                    // Stealth masking for videos inside playlist
                    // We must check if the *video itself* or *video owner* is stealth
                    {
                        $addFields: {
                            "owner.fullName": {
                                $cond: {
                                    if: {
                                        $or: [
                                            { $eq: ["$owner.isIdentityCloaked", true] },
                                            { $eq: ["$isStealthMode", true] }
                                        ]
                                    },
                                    then: ANONYMOUS_USER_NAME,
                                    else: "$owner.fullName"
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            thumbnail: 1,
                            title: 1,
                            duration: 1,
                            views: 1,
                            owner: 1,
                            createdAt: 1,
                            isStealthMode: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            isIdentityCloaked: 1
                        }
                    }
                ]
            }
        },
        { $unwind: "$owner" },
        // Stealth masking for playlist owner
        {
            $addFields: {
                "owner.fullName": {
                    $cond: {
                        if: {
                            $and: [
                                {
                                    $or: [
                                        { $eq: ["$owner.isIdentityCloaked", true] },
                                        { $eq: ["$isStealthMode", true] }
                                    ]
                                },
                                { $ne: ["$owner._id", req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null] }
                            ]
                        },
                        then: ANONYMOUS_USER_NAME,
                        else: "$owner.fullName"
                    }
                }
            }
        }
    ]);

    if (!playlistData?.length) throw new ApiError(404, "Playlist not found");

    const playlist = playlistData[0];
    const isOwner = req.user?._id?.toString() === playlist.owner._id.toString();

    // Privacy gate
    if (!playlist.isPublic && !isOwner) {
        throw new ApiError(403, "This playlist is private");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

// Add video to playlist
export const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Playlist or Video ID");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404, "Playlist not found");

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only modify your own playlists");
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    // Add if not already present (Set-like behavior)
    if (!playlist.videos.includes(videoId)) {
        playlist.videos.push(videoId);
        await playlist.save();
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video added to playlist"));
});

// Remove video from playlist
export const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid IDs");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404, "Playlist not found");

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    // Pull video from array
    playlist.videos = playlist.videos.filter(v => v.toString() !== videoId);
    await playlist.save();

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video removed from playlist"));
});

// Delete playlist
export const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid Playlist ID");

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404, "Playlist not found");

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    await Playlist.findByIdAndDelete(playlistId);

    // Cleanup: Remove this playlist from anyone who saved it
    await SavedPlaylist.deleteMany({ playlist: playlistId });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

// Update playlist
export const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description, isPublic, isStealthMode } = req.body;

    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid Playlist ID");

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404, "Playlist not found");

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    if (name) playlist.name = name;
    if (description) playlist.description = description;

    if (typeof isPublic !== "undefined") {
        playlist.isPublic = isPublic === "true" || isPublic === true;
    }

    // Allow updating stealth mode
    if (typeof isStealthMode !== "undefined") {
        playlist.isStealthMode = isStealthMode === "true" || isStealthMode === true;
    }

    await playlist.save();

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

// Get user playlists
export const toggleSavePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid Playlist ID");

    // Check if playlist exists and is accessible
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404, "Playlist not found");

    // Don't allow saving private playlists of others
    if (!playlist.isPublic && playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Cannot save private playlist");
    }

    // Check if already saved
    const existingSave = await SavedPlaylist.findOne({
        playlist: playlistId,
        savedBy: req.user._id
    });

    if (existingSave) {
        await SavedPlaylist.findByIdAndDelete(existingSave._id);
        return res.status(200).json(new ApiResponse(200, { isSaved: false }, "Playlist removed from library"));
    } else {
        await SavedPlaylist.create({
            playlist: playlistId,
            savedBy: req.user._id
        });
        return res.status(200).json(new ApiResponse(200, { isSaved: true }, "Playlist saved to library"));
    }
});