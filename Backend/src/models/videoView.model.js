import mongoose, { Schema } from "mongoose";

/**
 * VideoView Model - Tracks unique views per user per 12 hours
 * This ensures view count isn't inflated by repeated page refreshes
 */
const videoViewSchema = new Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true,
        index: true
    },
    viewer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    viewedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Compound index for efficient lookups
videoViewSchema.index({ video: 1, viewer: 1 });

// TTL index - auto-delete records after 12 hours (43200 seconds)
videoViewSchema.index({ viewedAt: 1 }, { expireAfterSeconds: 43200 });

export const VideoView = mongoose.model("VideoView", videoViewSchema);
