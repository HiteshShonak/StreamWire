import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js"; // Added Tweet Model
import { Like } from "../models/like.model.js";
import { Subscription } from "../models/subscription.model.js"; // Added for subscription check
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { updateVideoTrendScore, updateTweetTrendScore } from "../utils/trendScore.js"; // TrendScore
import { ANONYMOUS_USER_NAME } from "../constants.js";

// Helper: identity masking pipeline (reused for video and tweet lookups)
const getOwnerLookupPipeline = (viewerId) => {
    const validViewerId = viewerId ? new mongoose.Types.ObjectId(viewerId) : null;

    return [
        // 1. Lookup owner details
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    { $project: { username: 1, fullName: 1, avatar: 1, isIdentityCloaked: 1 } }
                ]
            }
        },
        { $unwind: "$owner" },

        // 2. Check subscription status
        {
            $lookup: {
                from: "subscriptions",
                let: { ownerId: "$owner._id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$channel", "$$ownerId"] },
                                    { $eq: ["$subscriber", validViewerId] },
                                    { $eq: ["$status", "ACCEPTED"] }
                                ]
                            }
                        }
                    }
                ],
                as: "ownerSubscription"
            }
        },

        // 3. Apply identity masking and add isSubscribed
        {
            $addFields: {
                "owner.isSubscribed": { $gt: [{ $size: "$ownerSubscription" }, 0] },
                "owner.fullName": {
                    $cond: {
                        if: {
                            $or: [
                                { $eq: ["$owner.isIdentityCloaked", true] }, // Global Cloak
                                { $eq: ["$isStealthMode", true] }            // Per-Comment Stealth
                            ]
                        },
                        then: ANONYMOUS_USER_NAME,
                        else: "$owner.fullName"
                    }
                },
                "owner.username": {
                    $cond: {
                        if: {
                            $or: [
                                { $eq: ["$owner.isIdentityCloaked", true] },
                                { $eq: ["$isStealthMode", true] }
                            ]
                        },
                        then: "anonymous",
                        else: "$owner.username"
                    }
                },
                "owner.avatar.url": {
                    $cond: {
                        if: {
                            $or: [
                                { $eq: ["$owner.isIdentityCloaked", true] },
                                { $eq: ["$isStealthMode", true] }
                            ]
                        },
                        then: "https://ui-avatars.com/api/?name=S&background=18181b&color=22c55e", // Stealth Avatar
                        else: "$owner.avatar.url"
                    }
                }
            }
        },

        // 4. Remove temporary fields
        {
            $project: {
                ownerSubscription: 0
            }
        }
    ];
};

// Video comments
export const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid Video ID");

    const aggregate = Comment.aggregate([
        { $match: { video: new mongoose.Types.ObjectId(videoId) } },
        ...getOwnerLookupPipeline(req.user?._id), // Pass viewer ID for subscription check
        { $sort: { createdAt: -1 } }
    ]);

    const options = { page: parseInt(page), limit: parseInt(limit) };
    const comments = await Comment.aggregatePaginate(aggregate, options);

    return res.status(200).json(new ApiResponse(200, comments, "Video comments fetched"));
});

export const addVideoComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content, isStealthMode } = req.body;

    if (!content?.trim()) throw new ApiError(400, "Content is required");
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid Video ID");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    // Stealth Logic: Inherit from User Global Setting unless overridden
    let finalStealthMode = req.user.isIdentityCloaked;
    if (typeof isStealthMode !== "undefined") {
        finalStealthMode = isStealthMode === "true" || isStealthMode === true;
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id,
        isStealthMode: finalStealthMode
    });

    // Update trendScore in background
    updateVideoTrendScore(videoId);

    return res.status(201).json(new ApiResponse(201, comment, "Comment added"));
});

// Tweet comments
export const getTweetComments = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid Tweet ID");

    const aggregate = Comment.aggregate([
        { $match: { tweet: new mongoose.Types.ObjectId(tweetId) } }, // Match Tweet
        ...getOwnerLookupPipeline(req.user?._id), // Pass viewer ID for subscription check
        { $sort: { createdAt: -1 } }
    ]);

    const options = { page: parseInt(page), limit: parseInt(limit) };
    const comments = await Comment.aggregatePaginate(aggregate, options);

    return res.status(200).json(new ApiResponse(200, comments, "Tweet comments fetched"));
});

export const addTweetComment = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content, isStealthMode } = req.body;

    if (!content?.trim()) throw new ApiError(400, "Content is required");
    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid Tweet ID");

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) throw new ApiError(404, "Tweet not found");

    let finalStealthMode = req.user.isIdentityCloaked;
    if (typeof isStealthMode !== "undefined") {
        finalStealthMode = isStealthMode === "true" || isStealthMode === true;
    }

    const comment = await Comment.create({
        content,
        tweet: tweetId, // Link to Tweet
        owner: req.user._id,
        isStealthMode: finalStealthMode
    });

    // Update trendScore in background
    updateTweetTrendScore(tweetId);

    return res.status(201).json(new ApiResponse(201, comment, "Reply posted"));
});

// Update comment
export const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content, isStealthMode } = req.body;

    if (!isValidObjectId(commentId)) throw new ApiError(400, "Invalid Comment ID");

    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to edit this comment");
    }

    if (content !== undefined) comment.content = content;
    if (typeof isStealthMode !== "undefined") {
        comment.isStealthMode = isStealthMode === "true" || isStealthMode === true;
    }

    await comment.save();

    return res.status(200).json(new ApiResponse(200, comment, "Comment updated"));
});

// Add comment
export const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) throw new ApiError(400, "Invalid Comment ID");

    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    // 1. Check if user owns the comment itself
    const isCommentOwner = comment.owner.toString() === req.user._id.toString();

    // 2. Check if user owns the Content (Video OR Tweet)
    // This allows creators to moderate their own comment sections
    let isContentOwner = false;

    if (comment.video) {
        const video = await Video.findById(comment.video);
        if (video && video.owner.toString() === req.user._id.toString()) isContentOwner = true;
    } else if (comment.tweet) {
        const tweet = await Tweet.findById(comment.tweet);
        if (tweet && tweet.owner.toString() === req.user._id.toString()) isContentOwner = true;
    }

    if (!isCommentOwner && !isContentOwner) {
        throw new ApiError(403, "You are not authorized to delete this comment");
    }

    await Comment.findByIdAndDelete(commentId);

    // Cleanup likes
    await Like.deleteMany({ comment: commentId });

    // Remove from pinned comments if it was pinned
    if (comment.video) {
        await Video.findByIdAndUpdate(comment.video, {
            $pull: { pinnedComments: commentId }
        });
        // Update trendScore in background
        updateVideoTrendScore(comment.video);
    }

    if (comment.tweet) {
        // Update trendScore in background
        updateTweetTrendScore(comment.tweet);
    }

    return res.status(200).json(new ApiResponse(200, {}, "Comment deleted"));
});

// Pinned comments
export const togglePinComment = asyncHandler(async (req, res) => {
    const { videoId, commentId } = req.params;

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid Video ID");
    if (!isValidObjectId(commentId)) throw new ApiError(400, "Invalid Comment ID");

    // 1. Find the video and verify ownership
    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the video owner can pin comments");
    }

    // 2. Verify comment exists and belongs to this video
    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");
    if (comment.video?.toString() !== videoId) {
        throw new ApiError(400, "Comment does not belong to this video");
    }

    // 3. Toggle pin status
    const isPinned = video.pinnedComments?.includes(commentId);

    if (isPinned) {
        // Unpin
        await Video.findByIdAndUpdate(videoId, {
            $pull: { pinnedComments: commentId }
        });
        return res.status(200).json(new ApiResponse(200, { isPinned: false }, "Comment unpinned"));
    } else {
        // Pin (limit to 3 pinned comments)
        if (video.pinnedComments?.length >= 3) {
            throw new ApiError(400, "Maximum 3 comments can be pinned. Unpin one first.");
        }
        await Video.findByIdAndUpdate(videoId, {
            $addToSet: { pinnedComments: commentId }
        });
        return res.status(200).json(new ApiResponse(200, { isPinned: true }, "Comment pinned"));
    }
});

export const getPinnedComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid Video ID");

    const video = await Video.findById(videoId).select('pinnedComments');
    if (!video) throw new ApiError(404, "Video not found");

    if (!video.pinnedComments?.length) {
        return res.status(200).json(new ApiResponse(200, [], "No pinned comments"));
    }

    // Get pinned comments with owner details
    const pinnedComments = await Comment.aggregate([
        {
            $match: {
                _id: { $in: video.pinnedComments.map(id => new mongoose.Types.ObjectId(id)) }
            }
        },
        ...getOwnerLookupPipeline(req.user?._id),
        {
            $addFields: {
                isPinned: true
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, pinnedComments, "Pinned comments fetched"));
});