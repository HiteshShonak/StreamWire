import mongoose from "mongoose";
import { History } from "../models/history.model.js";
import { Like } from "../models/like.model.js";
import { WatchLater } from "../models/watchLater.model.js";
import { SavedPlaylist } from "../models/savedPlaylist.model.js";
import { ANONYMOUS_USER_NAME } from "../constants.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Watch history (fetch videos watched by user, ordered by most recent)
export const getWatchHistory = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const aggregate = History.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        { $sort: { watchedAt: -1 } },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    // Nested Lookup to get the Video Owner
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                        isIdentityCloaked: 1,
                                    },
                                },
                            ],
                        },
                    },
                    { $addFields: { owner: { $first: "$owner" } } },
                    // Stealth masking (video level)
                    {
                        $addFields: {
                            "owner.fullName": {
                                $cond: {
                                    if: {
                                        $or: [
                                            { $eq: ["$owner.isIdentityCloaked", true] }, // Global Cloak
                                            { $eq: ["$isStealthMode", true] }            // Per-Video Stealth
                                        ]
                                    },
                                    then: ANONYMOUS_USER_NAME,
                                    else: "$owner.fullName"
                                }
                            }
                        }
                    }
                ],
            },
        },
        // Auto-clean: if video is deleted, remove from history result
        { $unwind: { path: "$video", preserveNullAndEmptyArrays: false } },
        {
            $project: {
                _id: 1,
                video: 1,
                lastPosition: 1, // Resume playback support
                watchedAt: 1,
            },
        },
    ]);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: {
            totalDocs: "totalVideos",
            docs: "history",
        },
    };

    const result = await History.aggregatePaginate(aggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Watch history fetched successfully"));
});

// Update watch progress (resume playback)
export const updateWatchProgress = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { lastPosition } = req.body;

    if (!mongoose.isValidObjectId(videoId)) {
        return res.status(400).json(new ApiResponse(400, null, "Invalid video ID"));
    }

    if (typeof lastPosition !== 'number' || lastPosition < 0) {
        return res.status(400).json(new ApiResponse(400, null, "Invalid lastPosition"));
    }

    const history = await History.findOneAndUpdate(
        { owner: req.user._id, video: videoId },
        {
            lastPosition,
            watchedAt: new Date() // Also update watchedAt when progress is saved
        },
        { upsert: true, new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, history, "Watch progress updated"));
});

// Liked videos
export const getWatchLater = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const aggregate = WatchLater.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
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
                                        isIdentityCloaked: 1,
                                    },
                                },
                            ],
                        },
                    },
                    { $addFields: { owner: { $first: "$owner" } } },
                    // Stealth masking
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
                    }
                ],
            },
        },
        { $unwind: { path: "$video", preserveNullAndEmptyArrays: false } },
        {
            $project: {
                _id: 1,
                video: 1,
                createdAt: 1,
            }
        }
    ]);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: {
            totalDocs: "totalVideos",
            docs: "list",
        },
    };

    const result = await WatchLater.aggregatePaginate(aggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Watch later fetched successfully"));
});


// Watch later videos
export const getLikedVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const aggregate = Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true, $ne: null }, // Ensure we only get Likes on VIDEOS
            },
        },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
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
                                        isIdentityCloaked: 1,
                                    },
                                },
                            ],
                        },
                    },
                    { $addFields: { owner: { $first: "$owner" } } },
                    // Stealth masking
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
                    }
                ],
            },
        },
        { $unwind: { path: "$video", preserveNullAndEmptyArrays: false } },
        {
            $project: {
                _id: "$video._id",
                videoFile: "$video.videoFile",
                thumbnail: "$video.thumbnail",
                title: "$video.title",
                description: "$video.description",
                duration: "$video.duration",
                views: "$video.views",
                createdAt: "$video.createdAt",
                isStealthMode: "$video.isStealthMode",
                owner: "$video.owner",
                likedAt: "$createdAt", // Map Like creation time to 'likedAt'
            },
        },
    ]);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: {
            totalDocs: "totalLikes",
            docs: "videos",
        },
    };

    const result = await Like.aggregatePaginate(aggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Liked videos fetched successfully"));
});


// Bookmarked tweets
export const getSavedPlaylists = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const aggregate = SavedPlaylist.aggregate([
        {
            $match: {
                savedBy: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "playlists",
                localField: "playlist",
                foreignField: "_id",
                as: "playlist",
                pipeline: [
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
                                        isIdentityCloaked: 1,
                                    },
                                },
                            ],
                        },
                    },
                    { $addFields: { owner: { $first: "$owner" } } },
                    // Stealth masking (playlist level - only global cloak applies here)
                    {
                        $addFields: {
                            "owner.fullName": {
                                $cond: {
                                    if: { $eq: ["$owner.isIdentityCloaked", true] },
                                    then: ANONYMOUS_USER_NAME,
                                    else: "$owner.fullName"
                                }
                            }
                        }
                    }
                ],
            },
        },
        { $unwind: { path: "$playlist", preserveNullAndEmptyArrays: false } },
        {
            $project: {
                _id: "$playlist._id",
                name: "$playlist.name",
                description: "$playlist.description",
                videoCount: { $size: "$playlist.videos" },
                owner: "$playlist.owner",
                savedAt: "$createdAt",
            },
        },
    ]);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: {
            totalDocs: "totalPlaylists",
            docs: "playlists",
        },
    };

    const result = await SavedPlaylist.aggregatePaginate(aggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Saved playlists fetched successfully"));
});


// Liked comments
export const toggleWatchLater = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    console.log('toggleWatchLater called - videoId:', videoId, 'userId:', userId);

    if (!videoId) {
        return res.status(400).json(new ApiResponse(400, null, "Video ID is required"));
    }

    // Check if already in watch later
    const existing = await WatchLater.findOne({
        video: videoId,
        owner: userId
    });

    console.log('📌 Existing watch later entry:', existing ? 'Found' : 'Not found');

    if (existing) {
        // Remove from watch later
        await WatchLater.findByIdAndDelete(existing._id);
        console.log('Removed from watch later');
        return res.status(200).json(new ApiResponse(200, { isInWatchLater: false }, "Removed from My List"));
    } else {
        // Add to watch later
        const newEntry = await WatchLater.create({ video: videoId, owner: userId });
        console.log('Added to watch later:', newEntry._id);
        return res.status(200).json(new ApiResponse(200, { isInWatchLater: true }, "Added to My List"));
    }
});


// Clear watch history
export const checkWatchLater = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    const existing = await WatchLater.findOne({
        video: videoId,
        owner: userId
    });

    return res.status(200).json(new ApiResponse(200, { isInWatchLater: !!existing }, "Watch later status"));
});