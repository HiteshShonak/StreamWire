import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import { History } from "../models/history.model.js";
import { VideoView } from "../models/videoView.model.js"; // View tracking
import { Subscription } from "../models/subscription.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary, sanitizeFilename, generateAutoThumbnail } from "../utils/cloudinary.js";
import { generateVideoMetadataFromUrl } from "../utils/ai.service.js";
import { summarizeVideo, askVideoQuestion } from "../services/videoAI.service.js";
import { maskIdentityStage } from "../utils/helper.js";
import { updateVideoTrendScore } from "../utils/trendScore.js";
import { updateFeedOnWatch } from "../utils/feedBuilder.js";
import { compressVideo } from "../utils/compressVideo.js";
import fs from "fs";

// Helper: common video pipeline
const getCommonVideoPipeline = (userId) => {
    // Handle anonymous users safely (undefined crashes mongoose)
    const userObjectId = userId ? new mongoose.Types.ObjectId(userId) : null;

    return [
        // 1. Populate owner
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    { $project: { username: 1, fullName: 1, avatar: 1, isIdentityCloaked: 1, isProfilePublic: 1 } },
                    // Get subscribers count for owner
                    {
                        $lookup: {
                            from: "subscriptions",
                            let: { ownerId: "$_id" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $eq: ["$channel", "$$ownerId"] },
                                                { $eq: ["$status", "ACCEPTED"] }
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: "subscribers"
                        }
                    },
                    {
                        $addFields: {
                            subscribersCount: { $size: "$subscribers" }
                        }
                    },
                    {
                        $project: { subscribers: 0 }
                    }
                ]
            }
        },
        { $unwind: "$owner" },

        // 2. Identity masking
        maskIdentityStage(),

        // 3. Likes count
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" }
            }
        },

        // 4. Comments count
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },
        {
            $addFields: {
                commentsCount: { $size: "$comments" }
            }
        },

        // 5. Like status (safe for anonymous)
        {
            $lookup: {
                from: "likes",
                let: { videoId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$video", "$$videoId"] },
                                    { $eq: ["$likedBy", userObjectId] } // Uses safe variable
                                ]
                            }
                        }
                    }
                ],
                as: "isLiked"
            }
        },
        {
            $addFields: {
                isLiked: { $gt: [{ $size: "$isLiked" }, 0] }
            }
        },

        // 6. Subscription status (safe for anonymous)
        {
            $lookup: {
                from: "subscriptions",
                let: { channelId: "$owner._id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$channel", "$$channelId"] },
                                    { $eq: ["$subscriber", userObjectId] }, // Uses safe variable
                                    { $eq: ["$status", "ACCEPTED"] }
                                ]
                            }
                        }
                    }
                ],
                as: "isSubscribed"
            }
        },
        {
            $addFields: {
                isSubscribed: { $gt: [{ $size: "$isSubscribed" }, 0] },
                "owner.isSubscribed": { $gt: [{ $size: "$isSubscribed" }, 0] }
            }
        },

        // 7. Cleanup
        {
            $project: {
                likes: 0,
                comments: 0
            }
        }
    ];
};

// Publish video
export const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, isStealthMode, tags } = req.body;

    if (!title?.trim()) {
        throw new ApiError(400, "Title is required");
    }

    let videoTags = [];
    if (tags) {
        videoTags = Array.isArray(tags)
            ? tags
            : tags.split(",").map((tag) => tag.trim()).filter(t => t);
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    console.log("Video upload request received:");
    console.log("   Title:", title);
    console.log("   Video path:", videoLocalPath);
    console.log("   Thumbnail path:", thumbnailLocalPath);

    if (!videoLocalPath) throw new ApiError(400, "Video file is required");

    const timestamp = Date.now();
    const sanitizedTitle = sanitizeFilename(title);
    const sanitizedUsername = sanitizeFilename(req.user.username);
    const videoFilename = `video_${sanitizedTitle}_${sanitizedUsername}_${timestamp}`;
    const thumbnailFilename = `thumbnail_${sanitizedTitle}_${sanitizedUsername}_${timestamp}`;

    console.log("Compressing video if needed...");
    let processedVideoPath;
    try {
        processedVideoPath = await compressVideo(videoLocalPath, 95);
    } catch (compressError) {
        console.error("Compression failed, using original file:", compressError.message);
        processedVideoPath = videoLocalPath;
    }

    console.log("Uploading video to Cloudinary...");
    const videoUpload = await uploadOnCloudinary(processedVideoPath, "video", videoFilename);
    if (!videoUpload) throw new ApiError(500, "Video upload failed. Please check your file and try again.");

    let thumbnailData;
    if (thumbnailLocalPath) {
        const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath, "thumbnail", thumbnailFilename);
        if (!thumbnailUpload) throw new ApiError(500, "Thumbnail upload failed");
        thumbnailData = {
            url: thumbnailUpload.secure_url,
            public_id: thumbnailUpload.public_id,
            isAutoGenerated: false
        };
        try { fs.unlinkSync(thumbnailLocalPath); } catch (e) { }
    } else {
        const autoThumbnailUrl = generateAutoThumbnail(videoUpload.public_id, { time: "1" });
        thumbnailData = {
            url: autoThumbnailUrl,
            public_id: null,
            isAutoGenerated: true
        };
        console.log(`Auto-generated thumbnail URL: ${autoThumbnailUrl}`);
        console.log(`Video public_id used: ${videoUpload.public_id}`);
    }

    // Stealth Logic: Force Stealth if User is Globally Cloaked
    let finalStealthMode = req.user.isIdentityCloaked;
    if (isStealthMode !== undefined) {
        finalStealthMode = req.user.isIdentityCloaked || (isStealthMode === "true" || isStealthMode === true);
    }

    // Description: use provided or mark for AI generation
    const videoDescription = description?.trim() || "";
    const needsAIDescription = !videoDescription;

    const video = await Video.create({
        title: title.trim(),
        description: videoDescription,
        videoFile: { url: videoUpload.secure_url, public_id: videoUpload.public_id },
        thumbnail: thumbnailData,
        duration: videoUpload.duration,
        owner: req.user._id,
        isPublished: true,
        isStealthMode: finalStealthMode,
        tags: videoTags,
        transcript: ""
    });

    // Set trendScore (new videos get recency boost)
    updateVideoTrendScore(video._id);

    // Generate transcript and description in background from Cloudinary URL
    generateVideoMetadataFromUrl(videoUpload.secure_url, video._id, { generateDescription: needsAIDescription });

    return res.status(201).json(new ApiResponse(201, video,
        needsAIDescription
            ? "Video published! AI is generating description & transcript..."
            : "Video published! AI is generating transcript..."
    ));
});

// Get video by ID
export const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

    // Smart View Tracking: 1 view per user per 12 hours
    if (userId) {
        // Check if user already viewed this video in the last 12 hours
        const existingView = await VideoView.findOne({
            video: videoId,
            viewer: userId
        });

        if (!existingView) {
            // New unique view - increment count and create tracking record
            await Promise.all([
                Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } }),
                VideoView.create({ video: videoId, viewer: userId })
            ]);
            // Update trendScore in background
            updateVideoTrendScore(videoId);
        }
        // If existingView exists, TTL will auto-delete it after 12 hours

        // Update watch history (every view updates the timestamp)
        await History.findOneAndUpdate(
            { owner: userId, video: videoId },
            {
                watchedAt: new Date(),
                lastPosition: 0 // Reset position on new view
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    } else {
        // Anonymous users still get views counted (no tracking)
        Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } }).exec();
        // Update trendScore in background
        updateVideoTrendScore(videoId);
    }

    const pipeline = [
        { $match: { _id: new mongoose.Types.ObjectId(videoId) } },
        ...getCommonVideoPipeline(userId)
    ];

    const videoData = await Video.aggregate(pipeline);

    if (!videoData?.length) throw new ApiError(404, "Video not found");
    const video = videoData[0];
    const isOwner = userId?.toString() === video.owner._id.toString();

    if (!video.owner.isProfilePublic && !isOwner && !video.isSubscribed) {
        throw new ApiError(403, "This video is private. Subscribe to watch.");
    }

    // Update user's personalized feed based on watched video tags (async, don't block response)
    if (userId && video.tags && video.tags.length > 0) {
        updateFeedOnWatch(userId, video.tags).catch(err =>
            console.error("Error updating feed on watch:", err)
        );
    }

    return res.status(200).json(new ApiResponse(200, video, "Video fetched"));
});

// Get all videos (feed & search)
export const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId, isStealthMode } = req.query;

    const pipeline = [];
    const matchStage = { isPublished: true };

    // Fix: Use Regex for partial matching instead of strict text search
    if (query) {
        matchStage.$or = [
            // "i" option means case-insensitive (ps5 matches Ps5)
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    // Filter by stealth mode
    if (isStealthMode !== undefined) {
        matchStage.isStealthMode = isStealthMode === 'true';
    }

    if (userId && isValidObjectId(userId)) {
        matchStage.owner = new mongoose.Types.ObjectId(userId);

        const isViewerOwner = req.user?._id?.toString() === userId.toString();
        const { publicView } = req.query;

        if (publicView === 'true' || !isViewerOwner) {
            matchStage.isStealthMode = false;
        }
    }

    pipeline.push({ $match: matchStage });

    // Handle Sorting
    if (sortBy && sortBy !== 'trendScore' && sortType) {
        pipeline.push({ $sort: { [sortBy]: sortType === "asc" ? 1 : -1 } });
    } else if (sortBy !== 'trendScore') {
        pipeline.push({ $sort: { createdAt: -1 } });
    }

    pipeline.push(...getCommonVideoPipeline(req.user?._id));

    // Trend Score Sort
    if (sortBy === 'trendScore') {
        pipeline.push({ $sort: { trendScore: sortType === "asc" ? 1 : -1 } });
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: { totalDocs: "totalVideos", docs: "videos" },
    };

    const result = await Video.aggregatePaginate(Video.aggregate(pipeline), options);

    return res.status(200).json(new ApiResponse(200, result, "Feed fetched"));
});

// Update video
export const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description, isStealthMode, tags } = req.body;

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    if (title) video.title = title;
    if (description) video.description = description;

    if (tags !== undefined) {
        video.tags = Array.isArray(tags)
            ? tags
            : tags.split(",").map((tag) => tag.trim()).filter(t => t);
    }

    if (typeof isStealthMode !== "undefined") {
        video.isStealthMode = isStealthMode === "true" || isStealthMode === true;
    }

    if (req.file) {
        const thumbnailUpload = await uploadOnCloudinary(req.file.path, "thumbnail");
        if (!thumbnailUpload) throw new ApiError(500, "Thumbnail upload failed");

        await deleteFromCloudinary(video.thumbnail.public_id);

        video.thumbnail = {
            url: thumbnailUpload.secure_url,
            public_id: thumbnailUpload.public_id,
        };
        try { fs.unlinkSync(req.file.path); } catch (e) { }
    }

    await video.save();

    return res.status(200).json(new ApiResponse(200, video, "Video updated"));
});

// Delete video
export const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    if (video.videoFile?.public_id) await deleteFromCloudinary(video.videoFile.public_id, "video");
    if (video.thumbnail?.public_id) await deleteFromCloudinary(video.thumbnail.public_id, "image");

    await Video.findByIdAndDelete(videoId);
    await Promise.all([
        Comment.deleteMany({ video: videoId }),
        Like.deleteMany({ video: videoId }),
        History.deleteMany({ video: videoId })
    ]);

    return res.status(200).json(new ApiResponse(200, {}, "Video deleted"));
});

// Toggle publish status
export const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res.status(200).json(new ApiResponse(200, { isPublished: video.isPublished }, "Status toggled"));
});

// 🤖 Generate AI summary of video
export const generateVideoSummary = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const summary = await summarizeVideo(videoId);

    return res.status(200).json(
        new ApiResponse(200, { summary }, "Video summary generated successfully")
    );
});

// 💬 Ask question about video
export const askQuestionAboutVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { question, conversationHistory } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if (!question || question.trim().length === 0) {
        throw new ApiError(400, "Question is required");
    }

    const answer = await askVideoQuestion(videoId, question, conversationHistory || []);

    return res.status(200).json(
        new ApiResponse(200, { answer, question }, "Answer generated successfully")
    );
});