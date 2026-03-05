import mongoose, { Schema } from "mongoose";

// tweetView Model - Tracks unique views per user per 12 hours
const tweetViewSchema = new Schema({
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet",
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
tweetViewSchema.index({ tweet: 1, viewer: 1 });

// TTL index - auto-delete records after 12 hours (43200 seconds)
tweetViewSchema.index({ viewedAt: 1 }, { expireAfterSeconds: 43200 });

export const TweetView = mongoose.model("TweetView", tweetViewSchema);
