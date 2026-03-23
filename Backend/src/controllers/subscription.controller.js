import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ANONYMOUS_USER_NAME } from "../constants.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Toggle subscription
export const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID");
    }

    // Prevent subscribing to self
    if (channelId.toString() === req.user?._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself");
    }

    const targetChannel = await User.findById(channelId);
    if (!targetChannel) {
        throw new ApiError(404, "Channel not found");
    }

    const existingSub = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId,
    });

    // 1. Unsubscribe Logic (Works for both PENDING and ACCEPTED)
    if (existingSub) {
        await Subscription.findByIdAndDelete(existingSub._id);
        return res
            .status(200)
            .json(new ApiResponse(200, { isSubscribed: false, status: null }, "Unsubscribed successfully"));
    }

    // 2. Subscribe logic (public profile = accepted, private = pending approval)
    const subStatus = targetChannel.isProfilePublic ? "ACCEPTED" : "PENDING";

    await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId,
        status: subStatus,
    });

    const message = subStatus === "PENDING"
        ? "Subscription request sent to private profile"
        : "Subscribed successfully";

    return res
        .status(200)
        .json(new ApiResponse(200, {
            isSubscribed: subStatus === "ACCEPTED",
            isPending: subStatus === "PENDING",
            status: subStatus
        }, message));
});

// Get subscribers list
export const getUserSubscriberList = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!isValidObjectId(channelId)) throw new ApiError(400, "Invalid channel ID");

    const aggregate = Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId),
                status: "ACCEPTED", // Only show actual subscribers, hide pending requests
            },
        },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            isIdentityCloaked: 1, // Needed for the masking logic below
                        },
                    },
                ],
            },
        },
        { $unwind: "$subscriber" },
        // Stealth masking: hide subscriber name if cloaked
        {
            $addFields: {
                "subscriber.fullName": {
                    $cond: {
                        if: { $eq: ["$subscriber.isIdentityCloaked", true] },
                        then: ANONYMOUS_USER_NAME,
                        else: "$subscriber.fullName",
                    },
                },
            },
        },
        {
            $project: {
                _id: 1,
                subscriber: 1,
                createdAt: 1,
            },
        },
    ]);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: {
            totalDocs: "totalSubscribers",
            docs: "subscribers",
        },
    };

    const result = await Subscription.aggregatePaginate(aggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Subscribers fetched successfully"));
});

// Get subscribed channels list
export const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid Subscriber ID");
    }

    const user = await User.findById(subscriberId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isOwner = req.user?._id.toString() === subscriberId.toString();

    // Privacy gate: prevent snooping on private users' following lists
    if (!user.isProfilePublic && !isOwner) {
        throw new ApiError(403, "This user's subscription list is private");
    }

    const aggregate = Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
                status: "ACCEPTED",
            },
        },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
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
        { $unwind: "$channel" },
        // Stealth masking (mask the names of channels they follow if those channels are stealth)
        {
            $addFields: {
                "channel.fullName": {
                    $cond: {
                        if: { $eq: ["$channel.isIdentityCloaked", true] },
                        then: ANONYMOUS_USER_NAME,
                        else: "$channel.fullName",
                    },
                },
            },
        },
        {
            $project: {
                _id: 1,
                channel: 1,
                createdAt: 1,
            },
        },
    ]);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: {
            totalDocs: "totalChannels",
            docs: "channels",
        },
    };

    const result = await Subscription.aggregatePaginate(aggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Subscribed channels fetched successfully"));
});


// Get pending requests (owner only)
export const getPendingRequests = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const aggregate = Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(req.user._id),
                status: "PENDING",
            },
        },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            // Note: No 'isIdentityCloaked' check here.
                            // Privacy Exception: Owner must see who is knocking at the door.
                        },
                    },
                ],
            },
        },
        { $unwind: "$subscriber" },
        {
            $project: {
                _id: 1,
                subscriber: 1,
                createdAt: 1,
            },
        },
    ]);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: {
            totalDocs: "totalRequests",
            docs: "requests",
        },
    };

    const result = await Subscription.aggregatePaginate(aggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Pending requests fetched successfully"));
});

// Toggle subscription
export const manageRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { action } = req.body; // Expects: { action: "ACCEPT" } or { action: "REJECT" }

    if (!["ACCEPT", "REJECT"].includes(action)) {
        throw new ApiError(400, "Action must be either ACCEPT or REJECT");
    }

    const request = await Subscription.findById(requestId);
    if (!request) {
        throw new ApiError(404, "Subscription request not found");
    }

    // Security: Ensure only the channel owner can approve/reject
    if (request.channel.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized: This is not your channel");
    }

    if (action === "REJECT") {
        await Subscription.findByIdAndDelete(requestId);
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Request rejected and removed"));
    }

    // Accept Logic
    request.status = "ACCEPTED";
    await request.save();

    return res
        .status(200)
        .json(new ApiResponse(200, request, "Request accepted! User is now a subscriber"));
});