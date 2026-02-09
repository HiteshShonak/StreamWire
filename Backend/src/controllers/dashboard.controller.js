import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/* ==========================================================================
   📊 GET CHANNEL STATS
   Aggregates Views, Subscribers, Likes, and Stealth Metrics
   ========================================================================== */
export const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // 1. Get Video Stats (Views, Total Count, and Stealth Count)
    const videoStats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" },
                totalVideos: { $sum: 1 },
                // 🎭 NEW: Count how many videos are currently in Stealth Mode
                totalStealthVideos: {
                    $sum: {
                        $cond: [{ $eq: ["$isStealthMode", true] }, 1, 0]
                    }
                }
            }
        }
    ]);

    // 2. Get Total Subscribers (Only ACCEPTED ones)
    const subscribersCount = await Subscription.countDocuments({
        channel: userId,
        status: "ACCEPTED"
    });

    // 3. Get Total Likes
    // Optimization: Fetch video IDs first, then count likes for those IDs
    // This is faster than joining the massive Likes collection
    const userVideos = await Video.find({ owner: userId }, { _id: 1 });
    const videoIds = userVideos.map(video => video._id);

    const totalLikes = await Like.countDocuments({
        video: { $in: videoIds }
    });

    const stats = {
        totalViews: videoStats[0]?.totalViews || 0,
        totalVideos: videoStats[0]?.totalVideos || 0,
        totalStealthVideos: videoStats[0]?.totalStealthVideos || 0, // 👈 Included in response
        totalSubscribers: subscribersCount || 0,
        totalLikes: totalLikes || 0
    };

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
});

/* ==========================================================================
   📑 GET CHANNEL VIDEOS (Manager View)
   Returns a table-ready list of videos with Publish/Stealth status
   ========================================================================== */
export const getChannelVideos = asyncHandler(async (req, res) => {
    // This view is for the CREATOR to manage their content.
    // We do NOT mask identity here, as the user needs to see their own data.
    
    const { page = 1, limit = 10, query } = req.query;

    const matchStage = {
        owner: new mongoose.Types.ObjectId(req.user._id)
    };

    // Optional: Search within your own dashboard
    if (query) {
        matchStage.$text = { $search: query };
    }

    const aggregate = Video.aggregate([
        {
            $match: matchStage
        },
        {
            // Sort by newest first
            $sort: { createdAt: -1 }
        },
        {
            $project: {
                _id: 1,
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                views: 1,
                duration: 1,
                isPublished: 1,
                isStealthMode: 1, // 👈 Frontend uses this to show "Ghost" icon
                createdAt: 1,
                updatedAt: 1
            }
        }
    ]);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: {
            totalDocs: "totalVideos",
            docs: "videos"
        }
    };

    const result = await Video.aggregatePaginate(aggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Channel videos fetched successfully"));
});