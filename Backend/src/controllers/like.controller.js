import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";     
import { Comment } from "../models/comment.model.js"; 
import { Tweet } from "../models/tweet.model.js";     
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { updateVideoTrendScore, updateTweetTrendScore } from "../utils/trendScore.js"; 

/* ==========================================================================
   👍 TOGGLE LIKE (Hardened Helper)
   Handles Validation, Existence Check, Toggle Logic & Stealth Inheritance.
   ========================================================================== */
const toggleLike = async (Model, resourceId, user, resourceField) => {
    
    // 1. Validate ID Format
    if (!isValidObjectId(resourceId)) {
        throw new ApiError(400, `Invalid ${resourceField} ID`);
    }

    // 🛡️ HARDENING: Force conversion to ObjectId
    const userID = new mongoose.Types.ObjectId(user._id);
    const resourceID = new mongoose.Types.ObjectId(resourceId);

    // 2. Check if Resource Exists (Prevent "Ghost Likes")
    const resource = await Model.findById(resourceID);
    if (!resource) {
        throw new ApiError(404, `${resourceField} not found`);
    }

    // 3. Define Query
    const query = { 
        likedBy: userID, 
        [resourceField]: resourceID 
    };

    // 4. Check if Like Exists
    const existingLike = await Like.findOne(query);

    if (existingLike) {
        // ✅ UNLIKE: Remove the document
        try {
            await Like.findByIdAndDelete(existingLike._id);
            return { isLiked: false };
        } catch (delErr) {
            // If deletion failed, surface a conflict-like response
            throw new ApiError(500, 'Failed to remove like');
        }
    } else {
        // ✅ LIKE: Create the document
        try {
            // 🎭 INHERIT STEALTH STATUS: from user OR resource OR resource owner
            const inheritedStealth = Boolean(
                user.isIdentityCloaked || resource.isStealthMode || resource.owner?.isIdentityCloaked
            );

            await Like.create({
                likedBy: userID,
                [resourceField]: resourceID,
                isStealthMode: inheritedStealth
            });
            return { isLiked: true };
        } catch (error) {
            // 🛡️ RACE CONDITION HANDLER
            // If DB says "Duplicate Key" (11000), it means it was just created.
            // We treat this collision as a "Toggle Off" request.
            if (error.code === 11000 || error.codeName === 'DuplicateKey') {
                try {
                    await Like.deleteOne(query);
                    return { isLiked: false };
                } catch (delErr) {
                    // If deletion fails here, escalate as server error
                    throw new ApiError(500, 'Like race resolution failed');
                }
            }
            throw error;
        }
    }
};

/* ==========================================================================
   📺 VIDEO LIKES
   ========================================================================== */
export const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const result = await toggleLike(Video, videoId, req.user, "video");

    // 🔥 Update trendScore in background if liked
    if (result.isLiked) {
        updateVideoTrendScore(videoId);
    }

    return res.status(200).json(new ApiResponse(200, result, result.isLiked ? "Video Liked" : "Video Unliked"));
});

/* ==========================================================================
   💬 COMMENT LIKES
   ========================================================================== */
export const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const result = await toggleLike(Comment, commentId, req.user, "comment");

    return res.status(200).json(new ApiResponse(200, result, result.isLiked ? "Comment Liked" : "Comment Unliked"));
});

/* ==========================================================================
   🐦 TWEET LIKES
   ========================================================================== */
export const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const result = await toggleLike(Tweet, tweetId, req.user, "tweet");

    // 🔥 Update trendScore in background if liked
    if (result.isLiked) {
        updateTweetTrendScore(tweetId);
    }

    return res.status(200).json(new ApiResponse(200, result, result.isLiked ? "Tweet Liked" : "Tweet Unliked"));
});

/* ==========================================================================
   📚 GET LIKED VIDEOS (For Library)
   ========================================================================== */
export const getLikedVideos = asyncHandler(async (req, res) => {
    const likes = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true } // Only find video likes
            }
        },
        { $sort: { createdAt: -1 } }, // Show most recent likes first
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
                                { $project: { username: 1, fullName: 1, avatar: 1 } }
                            ]
                        }
                    },
                    { $unwind: "$owner" }
                ]
            }
        },
        { $unwind: "$video" },
        {
            $project: {
                _id: "$video._id",
                videoFile: "$video.videoFile",
                thumbnail: "$video.thumbnail",
                title: "$video.title",
                views: "$video.views",
                duration: "$video.duration",
                owner: "$video.owner",
                likedAt: "$createdAt" // Pass the like timestamp
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, likes, "Liked videos fetched successfully"));
});