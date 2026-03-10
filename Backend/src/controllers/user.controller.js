import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ANONYMOUS_USER_NAME, COOKIE_OPTIONS } from "../constants.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { resolveIdentityMedia } from "../utils/identity.resolver.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { sanitizeUser, maskIdentityStage } from "../utils/helper.js";
import { buildUserFeed, getRecommendedVideos, getAllTags, getPopularTags } from "../utils/feedBuilder.js";


// Search users by username or full name
export const searchUsers = asyncHandler(async (req, res) => {
    const { query, page = 1, limit = 10 } = req.query;

    if (!query) throw new ApiError(400, "Search query is required");

    const pipeline = [
        {
            $match: {
                $or: [
                    { username: { $regex: query, $options: "i" } },
                    { fullName: { $regex: query, $options: "i" } }
                ],
                isIdentityCloaked: false,
                accountStatus: "ACTIVE"
            }
        },
        { $sort: { username: 1 } },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                pipeline: [
                    { $match: { status: "ACCEPTED" } },
                    { $project: { _id: 1 } }
                ],
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                let: { channelId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$channel", "$$channelId"] },
                                    { $eq: ["$subscriber", req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null] },
                                    { $eq: ["$status", "ACCEPTED"] }
                                ]
                            }
                        }
                    },
                    { $project: { _id: 1 } }
                ],
                as: "isSubscribed"
            }
        },
        {
            $addFields: {
                subscribersCount: { $size: "$subscribers" },
                isSubscribed: { $gt: [{ $size: "$isSubscribed" }, 0] }
            }
        },
        {
            $project: {
                _id: 1,
                username: 1,
                fullName: 1,
                avatar: 1,
                isProfilePublic: 1,
                subscribersCount: 1,
                isSubscribed: 1,
                bio: 1
            }
        }
    ];

    const options = { page: parseInt(page), limit: parseInt(limit) };
    const result = await User.aggregatePaginate(User.aggregate(pipeline), options);

    return res.status(200).json(new ApiResponse(200, result, "Users found"));
});


// Get channel profile with subscription stats
export const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing");
    }

    const targetUser = await User.findOne({ username: username.toLowerCase().trim() });
    if (!targetUser) throw new ApiError(404, "Channel not found");

    if (targetUser.isIdentityCloaked) {
        return res.status(200).json(new ApiResponse(200, {
            _id: targetUser._id,
            username: "anonymous",
            fullName: ANONYMOUS_USER_NAME,
            avatar: { url: "https://ui-avatars.com/api/?name=S&background=18181b&color=22c55e" },
            coverImage: null,
            subscribersCount: 0,
            channelsSubscribedToCount: 0,
            isSubscribed: false,
            bio: "This profile is currently masked.",
            isIdentityCloaked: true
        }, "Channel profile fetched (Masked)"));
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username.toLowerCase().trim(),
                accountStatus: "ACTIVE",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                pipeline: [
                    { $match: { status: "ACCEPTED" } },
                    { $count: "count" }
                ],
                as: "subscribersCount",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                pipeline: [
                    { $match: { status: "ACCEPTED" } },
                    { $count: "count" }
                ],
                as: "subscribedToCount",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                let: { channelId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$channel", "$$channelId"] },
                                    { $eq: ["$subscriber", req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null] }
                                ]
                            }
                        }
                    }
                ],
                as: "relationship",
            },
        },
        {
            $addFields: {
                subscribersCount: { $ifNull: [{ $first: "$subscribersCount.count" }, 0] },
                channelsSubscribedToCount: { $ifNull: [{ $first: "$subscribedToCount.count" }, 0] },
                isOwner: {
                    $eq: ["$_id", req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null],
                },
                relationshipStatus: { $first: "$relationship.status" }
            },
        },
        {
            $addFields: {
                isSubscribed: { $eq: ["$relationshipStatus", "ACCEPTED"] },
                isRequestPending: { $eq: ["$relationshipStatus", "PENDING"] }
            }
        },

        maskIdentityStage(),

        {
            $project: {
                username: 1,
                fullName: 1,
                avatar: 1,
                coverImage: 1,
                bio: 1,
                isProfilePublic: 1,
                isIdentityCloaked: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                isRequestPending: 1,
                isOwner: 1,
                accountStatus: 1,
                createdAt: 1
            },
        },
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "Channel not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "Channel profile fetched successfully"));
});


// Get current authenticated user
export const getCurrentUser = asyncHandler(async (req, res) => {
    // req.user is already populated by auth middleware
    const user = sanitizeUser(req.user);

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Current user fetched successfully"));
});


// Update user profile
export const updateProfile = asyncHandler(async (req, res) => {
    const {
        username,
        fullName,
        bio,
        avatarColor,
        coverColor,
        feedPreferences
    } = req.body;

    const user = await User.findById(req.user?._id);
    if (!user) throw new ApiError(404, "User not found");

    if (username && username !== user.username) {
        const cleanUsername = username.toLowerCase().trim();
        const usernameExists = await User.findOne({ username: cleanUsername });
        if (usernameExists) throw new ApiError(409, "Username already taken");
        user.username = cleanUsername;
    }

    if (fullName) user.fullName = fullName;
    if (bio) user.bio = bio;

    if (feedPreferences) {
        if (Array.isArray(feedPreferences)) {
            user.feedPreferences = feedPreferences;
        } else if (typeof feedPreferences === "string") {
            user.feedPreferences = feedPreferences
                .split(",")
                .map((tag) => tag.trim())
                .filter(tag => tag.length > 0);
        }
    }

    if (req.files?.avatar || avatarColor) {
        const avatarResult = await resolveIdentityMedia({
            localPath: req.files?.avatar ? req.files.avatar[0].path : null,
            type: "avatar",
            username: user.username,
            fullName: user.fullName,
            chosenColor: avatarColor,
            existingData: user.avatar,
        });

        if (req.files?.avatar && user.avatar?.public_id && !user.avatar.public_id.includes("default_")) {
            await deleteFromCloudinary(user.avatar.public_id, "image");
        }

        user.avatar = { url: avatarResult.url, public_id: avatarResult.public_id };
    }

    if (req.files?.coverImage || coverColor) {
        const coverResult = await resolveIdentityMedia({
            localPath: req.files?.coverImage ? req.files.coverImage[0].path : null,
            type: "cover",
            username: user.username,
            chosenColor: coverColor,
            existingData: user.coverImage,
        });

        if (req.files?.coverImage && user.coverImage?.public_id && !user.coverImage.public_id.includes("default_")) {
            await deleteFromCloudinary(user.coverImage.public_id, "image");
        }

        user.coverImage = {
            url: coverResult.url,
            public_id: coverResult.public_id,
        };
    }

    await user.save();

    const updatedUser = sanitizeUser(user);

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});


// Update privacy settings
export const updatePrivacySettings = asyncHandler(async (req, res) => {
    const { isProfilePublic, isIdentityCloaked } = req.body;

    const user = await User.findById(req.user?._id);
    if (!user) throw new ApiError(404, "User not found");

    if (typeof isProfilePublic !== "undefined") {
        user.isProfilePublic = isProfilePublic;
    }

    if (typeof isIdentityCloaked !== "undefined") {
        user.isIdentityCloaked = isIdentityCloaked;
    }

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                isProfilePublic: user.isProfilePublic,
                isIdentityCloaked: user.isIdentityCloaked,
            },
            "Privacy settings updated successfully"
        )
    );
});


// Change password
export const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Both old and new passwords are required");
    }

    const user = await User.findById(req.user?._id);
    if (!user) throw new ApiError(404, "User not found");

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid old password");
    }

    user.password = newPassword;
    user.refreshTokens = [];
    user.tokenVersion = (user.tokenVersion || 0) + 1; // invalidate all existing JWTs

    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    await user.addRefreshToken(newRefreshToken);

    return res
        .status(200)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS)
        .cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken: newRefreshToken },
                "Password changed successfully"
            )
        );
});


// Deactivate account
export const deactivateAccount = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id);
    if (!user) throw new ApiError(404, "User not found");

    user.accountStatus = "DEACTIVATED";
    user.isIdentityCloaked = false; // Reset stealth so they don't get stuck if reactivated
    user.refreshTokens = [];
    user.tokenVersion = (user.tokenVersion || 0) + 1;

    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .clearCookie("accessToken", COOKIE_OPTIONS)
        .clearCookie("refreshToken", COOKIE_OPTIONS)
        .json(new ApiResponse(200, {}, "Account deactivated. See you soon!"));
});


// Get personalized video recommendations

export const getForYouFeed = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    // Get user data to check feed
    const user = await User.findById(userId);

    if (!user || !user.feedPreferences || user.feedPreferences.length === 0) {
        // No feed tags, try to build from history
        await buildUserFeed(userId);

        // Refresh user data
        const updatedUser = await User.findById(userId);

        if (!updatedUser.feedPreferences || updatedUser.feedPreferences.length === 0) {
            // Still no feed, return empty or popular videos
            return res.status(200).json(
                new ApiResponse(200, { videos: [], totalVideos: 0, page: 1, limit },
                    "No personalized recommendations yet. Watch more videos to build your feed!")
            );
        }
    }

    // Find videos with tags matching user's feed
    const skip = (page - 1) * limit;

    const videos = await Video.aggregate([
        {
            $match: {
                tags: { $in: user.feedPreferences },
                isPublished: true
            }
        },
        // Calculate relevance score based on tag matches
        {
            $addFields: {
                relevanceScore: {
                    $size: {
                        $setIntersection: ["$tags", user.feedPreferences]
                    }
                }
            }
        },
        // Populate owner
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
        // Sort by relevance first, then by recency
        { $sort: { relevanceScore: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) }
    ]);

    // Get total count
    const totalVideos = await Video.countDocuments({
        tags: { $in: user.feedPreferences },
        isPublished: true
    });

    return res.status(200).json(
        new ApiResponse(200, {
            videos,
            totalVideos,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(totalVideos / limit)
        }, "For You feed fetched successfully")
    );
});


// Get user's feed preferences (selected tags)
export const getFeedPreferences = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('feedPreferences');

    if (!user) throw new ApiError(404, "User not found");

    return res.status(200).json(
        new ApiResponse(200, {
            feedPreferences: user.feedPreferences || []
        }, "Feed preferences fetched successfully")
    );
});


// Update feed preferences
export const updateFeedPreferences = asyncHandler(async (req, res) => {
    const { tags } = req.body;

    if (!Array.isArray(tags)) {
        throw new ApiError(400, "Tags must be an array");
    }

    if (tags.length > 20) {
        throw new ApiError(400, "Feed cannot contain more than 20 tags");
    }

    // Validate and clean tags
    const cleanedTags = tags
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, 20);

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { feedPreferences: cleanedTags },
        { new: true, runValidators: true }
    ).select('feedPreferences');

    return res.status(200).json(
        new ApiResponse(200, { feedPreferences: user.feedPreferences }, "Feed preferences updated successfully")
    );
});


// Build feed from watch history
export const buildFeedFromHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    console.log('Building feed for user:', userId);

    const tags = await buildUserFeed(userId);
    console.log('Tags from history:', tags);

    if (tags.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, { feedPreferences: [] },
                "No watch history found. Watch some videos to build your feed!")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, { feedPreferences: tags },
            `Feed built successfully with ${tags.length} tags based on your watch history`)
    );
});


// Get all available tags from videos
export const getAllAvailableTags = asyncHandler(async (req, res) => {
    const tags = await getAllTags();

    return res.status(200).json(
        new ApiResponse(200, { tags }, "All tags fetched successfully")
    );
});


// Get popular tags (trending)
export const getPopularTagsList = asyncHandler(async (req, res) => {
    const { limit = 50 } = req.query;

    const tags = await getPopularTags(parseInt(limit));

    return res.status(200).json(
        new ApiResponse(200, { tags }, "Popular tags fetched successfully")
    );
});