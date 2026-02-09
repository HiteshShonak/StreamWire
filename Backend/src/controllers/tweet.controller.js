import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js"; 
import { PollVote } from "../models/pollVote.model.js"; 
import { Like } from "../models/like.model.js"; 
import { Comment } from "../models/comment.model.js"; 
import { TweetView } from "../models/tweetView.model.js"; // 👈 View tracking
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { updateTweetTrendScore } from "../utils/trendScore.js"; // 🔥 TrendScore
import { ANONYMOUS_USER_NAME } from "../constants.js";

/* ==========================================================================
   🛠️ HELPER: COMMON AGGREGATION PIPELINE
   Handles: Identity, Likes, Comments, Polls, Subscription Status
   ========================================================================== */
const getTweetAggregation = (userId) => {
    const validUserId = userId ? new mongoose.Types.ObjectId(userId) : null;

    return [
        // 1. 🔔 CHECK SUBSCRIPTION STATUS
        {
            $lookup: {
                from: "subscriptions",
                let: { ownerId: "$owner" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$channel", "$$ownerId"] },
                                    { $eq: ["$subscriber", validUserId] }
                                ]
                            }
                        }
                    },
                    { $project: { _id: 1 } } // ⚡ Optimization: Only fetch ID
                ],
                as: "isSubscribed"
            }
        },
        {
            $addFields: {
                isSubscribed: { $gt: [{ $size: "$isSubscribed" }, 0] }
            }
        },

        // 2. 👤 POPULATE OWNER
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

        // 3. 🎭 IDENTITY MASKING
        {
            $addFields: {
                "owner.isSubscribed": "$isSubscribed", // Add subscription status to owner object
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
                        then: "https://ui-avatars.com/api/?name=S&background=18181b&color=22c55e",
                        else: "$owner.avatar.url"
                    }
                }
            }
        },

        // 4. ❤️ LIKE STATUS & COUNT
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes",
                pipeline: [
                    { $project: { likedBy: 1 } } // ⚡ Optimization: Don't fetch full Like docs
                ]
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                isLiked: {
                    $cond: {
                        if: { $in: [validUserId, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },

        // 5. 💬 COMMENT COUNT
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "tweet",
                as: "comments",
                pipeline: [
                    { $project: { _id: 1 } } // ⚡ Optimization: Don't fetch comment content
                ]
            }
        },
        {
            $addFields: {
                commentsCount: { $size: "$comments" }
            }
        },

        // 6. 🗳️ POLL VOTE STATUS
        {
            $lookup: {
                from: "pollvotes",
                let: { tweetId: "$_id" },
                pipeline: [
                    { 
                        $match: { 
                            $expr: { 
                                $and: [
                                    { $eq: ["$tweet", "$$tweetId"] },
                                    { $eq: ["$voter", validUserId] }
                                ] 
                            } 
                        } 
                    },
                    { $project: { optionIndex: 1 } }
                ],
                as: "myVote"
            }
        },
        {
            $addFields: {
                userVote: { $arrayElemAt: ["$myVote.optionIndex", 0] }
            }
        },

        // 7. 🧹 CLEANUP
        {
            $project: {
                likes: 0,
                comments: 0,
                myVote: 0
            }
        }
    ];
};

/* ==========================================================================
   🌍 GET FEED
   ========================================================================== */
export const getAllTweets = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, isStealthMode, type, query, sortBy, sortType } = req.query;
    const userId = req.user?._id;

    const matchStage = {};
    let postAggregationMatch = null;

    if (query) matchStage.$text = { $search: query };

    // Explicit stealth filtering (if requested)
    // NOTE: If requesting stealth feed, include posts that are either
    // isStealthMode=true OR whose owner is identity-cloaked. We can't match
    // owner.isIdentityCloaked before the owner $lookup, so we'll apply a
    // post-aggregation match after owner is populated.
    if (isStealthMode !== undefined) {
        if (isStealthMode === "true") {
            // leave initial match broad; apply precise match after aggregation
            postAggregationMatch = { $or: [{ isStealthMode: true }, { "owner.isIdentityCloaked": true }] };
        } else {
            matchStage.isStealthMode = false;
        }
    }

    if (type === "following" && userId) {
        const subscriptions = await Subscription.find({
            subscriber: userId,
            status: "ACCEPTED"
        }).select("channel");
        
        const channelIds = subscriptions.map(sub => sub.channel);
        channelIds.push(userId);
        matchStage.owner = { $in: channelIds };
    }

    // Build sort stage - support trendScore sorting
    let sortStage;
    if (query) {
        sortStage = { $sort: { score: { $meta: "textScore" } } };
    } else if (sortBy === 'trendScore') {
        // For trendScore, we need to sort AFTER the aggregation adds trendScore
        sortStage = null; // Will be added after aggregation
    } else if (sortBy && sortType) {
        sortStage = { $sort: { [sortBy]: sortType === "asc" ? 1 : -1 } };
    } else {
        sortStage = { $sort: { createdAt: -1 } };
    }

    const pipeline = [
        { $match: matchStage },
        ...(sortStage && sortBy !== 'trendScore' ? [sortStage] : []),
        ...getTweetAggregation(userId),
        // Apply post-aggregation stealth match when needed
        ...(postAggregationMatch ? [{ $match: postAggregationMatch }] : []),
        // Add sort by trendScore AFTER aggregation calculates it
        ...(sortBy === 'trendScore' ? [{ $sort: { trendScore: sortType === "asc" ? 1 : -1 } }] : [])
    ];

    const options = { page: parseInt(page, 10), limit: parseInt(limit, 10) };
    const result = await Tweet.aggregatePaginate(Tweet.aggregate(pipeline), options);

    return res.status(200).json(new ApiResponse(200, result, "Feed fetched successfully"));
});

/* ==========================================================================
   📝 CREATE TWEET
   ========================================================================== */
export const createTweet = asyncHandler(async (req, res) => {
    const { content, isPoll, pollQuestion, pollOptions, isStealthMode } = req.body;

    // 🔍 DEBUG LOGGING
    console.log('📝 CREATE TWEET - Request Body:', req.body);
    console.log('📎 CREATE TWEET - File Present:', !!req.file);
    if (req.file) {
        console.log('📁 File Details:', {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path
        });
    }

    if (!content?.trim()) throw new ApiError(400, "Content is required");

    let image = null;
    if (req.file) {
        console.log('☁️ Uploading to Cloudinary:', req.file.path);
        
        // Generate custom filename: first 10 chars of content + username + timestamp
        const contentPrefix = content.trim()
            .substring(0, 10)
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '');
        const customFilename = `${contentPrefix}_${req.user.username}_${Date.now()}`;
        
        console.log('📝 Custom filename:', customFilename);
        const uploadedImage = await uploadOnCloudinary(req.file.path, "tweet", customFilename);
        if (!uploadedImage) {
            console.log('❌ Cloudinary upload failed');
            throw new ApiError(500, "Image upload failed");
        }
        console.log('✅ Cloudinary upload successful:', uploadedImage.secure_url);
        image = { url: uploadedImage.secure_url, public_id: uploadedImage.public_id };
    } else {
        console.log('ℹ️ No file attached to request');
    }

    let poll = null;
    if (isPoll === "true" || isPoll === true) {
        if (!pollQuestion?.trim()) throw new ApiError(400, "Poll question is required");
        
        let parsedOptions = typeof pollOptions === "string" ? JSON.parse(pollOptions) : pollOptions;
        if (!Array.isArray(parsedOptions) || parsedOptions.length < 2) throw new ApiError(400, "Poll must have 2+ options");

        poll = {
            question: pollQuestion,
            options: parsedOptions.map(opt => ({ text: opt.toString().trim(), votes: 0 }))
        };
    }

    let finalStealthMode = req.user.isIdentityCloaked;
    if (isStealthMode !== undefined) finalStealthMode = isStealthMode === "true" || isStealthMode === true;

    const tweet = await Tweet.create({
        content,
        image,
        poll,
        owner: req.user._id,
        isStealthMode: finalStealthMode
    });

    // 🔥 Initialize trendScore (new tweets get recency boost)
    updateTweetTrendScore(tweet._id);

    const pipeline = [
        { $match: { _id: tweet._id } },
        ...getTweetAggregation(req.user._id)
    ];
    const aggregatedTweet = await Tweet.aggregate(pipeline);

    return res.status(201).json(new ApiResponse(201, aggregatedTweet[0], "Tweet created successfully"));
});

/* ==========================================================================
   🐦 GET USER TWEETS
   ========================================================================== */
export const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10, publicView } = req.query;

    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid User ID");

    const isViewerOwner = req.user?._id?.toString() === userId.toString();
    const matchStage = { owner: new mongoose.Types.ObjectId(userId) };

    // If publicView is true, always filter stealth tweets (even for owner)
    if (publicView === 'true' || !isViewerOwner) matchStage.isStealthMode = false;

    const pipeline = [
        { $match: matchStage },
        { $sort: { createdAt: -1 } },
        ...getTweetAggregation(req.user?._id)
    ];

    const options = { page: parseInt(page, 10), limit: parseInt(limit, 10) };
    const result = await Tweet.aggregatePaginate(Tweet.aggregate(pipeline), options);

    return res.status(200).json(new ApiResponse(200, result, "User tweets fetched"));
});

/* ==========================================================================
   ✏️ UPDATE TWEET
   ========================================================================== */
export const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content, isStealthMode } = req.body;

    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid Tweet ID");

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) throw new ApiError(404, "Tweet not found");
    if (tweet.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "Unauthorized");

    if (content !== undefined) tweet.content = content;
    
    if (typeof isStealthMode !== "undefined") {
        tweet.isStealthMode = isStealthMode === "true" || isStealthMode === true;
    }

    await tweet.save();

    const pipeline = [
        { $match: { _id: tweet._id } },
        ...getTweetAggregation(req.user._id)
    ];
    const updatedTweets = await Tweet.aggregate(pipeline);

    return res.status(200).json(new ApiResponse(200, updatedTweets[0], "Tweet updated"));
});

/* ==========================================================================
   🗑️ DELETE TWEET
   ========================================================================== */
export const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid Tweet ID");

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) throw new ApiError(404, "Tweet not found");
    if (tweet.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "Unauthorized");

    // 1. Delete tweet from database INSTANTLY (user sees immediate response)
    await Tweet.findByIdAndDelete(tweetId);
    
    // 2. Send success response immediately
    const response = res.status(200).json(new ApiResponse(200, {}, "Tweet deleted"));

    // 3. Background cleanup (doesn't block response)
    // Delete orphaned image from Cloudinary
    if (tweet.image?.public_id) {
        deleteFromCloudinary(tweet.image.public_id, "image")
            .then(() => console.log('✅ Tweet image deleted from Cloudinary:', tweet.image.public_id))
            .catch(err => console.error('❌ Failed to delete tweet image from Cloudinary:', err.message));
    }
    
    // Delete related records (poll votes, likes, comments)
    Promise.all([
        PollVote.deleteMany({ tweet: tweetId }),
        Like.deleteMany({ tweet: tweetId }),
        Comment.deleteMany({ tweet: tweetId })
    ])
        .then(() => console.log('✅ Related records deleted for tweet:', tweetId))
        .catch(err => console.error('❌ Failed to delete related records:', err.message));

    return response;
});

/* ==========================================================================
   🗳️ VOTE ON POLL
   ========================================================================== */
export const voteOnPoll = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { optionIndex } = req.body;
    const userId = req.user._id;

    // Explicit check to handle index 0 correctly
    if (optionIndex === undefined || optionIndex === null) {
        throw new ApiError(400, "Option index is required");
    }

    const index = parseInt(optionIndex, 10);
    if (isNaN(index) || index < 0) throw new ApiError(400, "Invalid option index");

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) throw new ApiError(404, "Tweet not found");
    if (!tweet.poll || !tweet.poll.options) throw new ApiError(400, "This tweet has no poll");

    if (index >= tweet.poll.options.length) throw new ApiError(400, "Option index out of range");

    const existingVote = await PollVote.findOne({ tweet: tweetId, voter: userId });

    if (existingVote) {
        if (existingVote.optionIndex === index) {
            // Toggle Off (Remove Vote)
            await Tweet.findByIdAndUpdate(tweetId, { $inc: { [`poll.options.${index}.votes`]: -1 } });
            await PollVote.findByIdAndDelete(existingVote._id);
        } else {
            // Change Vote (Switch Option)
            await Tweet.findByIdAndUpdate(tweetId, { 
                $inc: { 
                    [`poll.options.${existingVote.optionIndex}.votes`]: -1,
                    [`poll.options.${index}.votes`]: 1 
                } 
            });
            existingVote.optionIndex = index;
            await existingVote.save();
        }
    } else {
        // New Vote
        await Tweet.findByIdAndUpdate(tweetId, { $inc: { [`poll.options.${index}.votes`]: 1 } });
        await PollVote.create({ tweet: tweetId, voter: userId, optionIndex: index });
    }

    // 🔥 Update trendScore in background (poll votes affect engagement)
    updateTweetTrendScore(tweetId);

    // Re-fetch aggregated data for instant UI sync
    const pipeline = [
        { $match: { _id: new mongoose.Types.ObjectId(tweetId) } },
        ...getTweetAggregation(userId)
    ];

    const updatedTweets = await Tweet.aggregate(pipeline);

    if (!updatedTweets.length) throw new ApiError(500, "Error refreshing poll data");

    return res.status(200).json(new ApiResponse(200, updatedTweets[0], "Vote recorded"));
});

/* ==========================================================================
   🔎 GET SINGLE TWEET
   ========================================================================== */
export const getTweetById = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid Tweet ID");

    // 📊 Smart View Tracking: 1 view per user per 12 hours
    if (userId) {
        // Check if user already viewed this tweet in the last 12 hours
        const existingView = await TweetView.findOne({
            tweet: tweetId,
            viewer: userId
        });

        if (!existingView) {
            // New unique view - increment count and create tracking record
            await Promise.all([
                Tweet.findByIdAndUpdate(tweetId, { $inc: { views: 1 } }),
                TweetView.create({ tweet: tweetId, viewer: userId })
            ]);
            // 🔥 Update trendScore in background
            updateTweetTrendScore(tweetId);
        }
        // If existingView exists, TTL will auto-delete it after 12 hours
    } else {
        // Anonymous users still get views counted (no tracking)
        Tweet.findByIdAndUpdate(tweetId, { $inc: { views: 1 } }).exec();
        // 🔥 Update trendScore in background
        updateTweetTrendScore(tweetId);
    }

    const pipeline = [
        { $match: { _id: new mongoose.Types.ObjectId(tweetId) } },
        ...getTweetAggregation(userId)
    ];

    const tweets = await Tweet.aggregate(pipeline);
    if (!tweets?.length) throw new ApiError(404, "Tweet not found");

    return res.status(200).json(new ApiResponse(200, tweets[0], "Tweet fetched successfully"));
});