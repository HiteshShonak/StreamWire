import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tweetSchema = new Schema({
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    image: {
        url: String,
        public_id: String
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    poll: {
        question: { type: String, trim: true },
        options: [
            {
                text: { type: String, required: true, trim: true },
                votes: { type: Number, default: 0 }
            }
        ]
    },
    isStealthMode: {
        type: Boolean,
        default: false
    },
    // 👁️ Views tracking (like videos)
    views: {
        type: Number,
        default: 0
    },
    // 🔥 Trend Score - Calculated on engagement
    trendScore: {
        type: Number,
        default: 0,
        index: true
    }
}, { timestamps: true });

// --- 🔎 SEARCH INDEX (The Missing Piece) ---
// This allows the search bar to find words inside tweets
tweetSchema.index({ content: "text" }); 

// Performance Index
tweetSchema.index({ owner: 1, createdAt: -1 });
tweetSchema.index({ views: -1 });       // For "Most Viewed" sorting
tweetSchema.index({ trendScore: -1 });  // For "Trending" sorting

tweetSchema.plugin(mongooseAggregatePaginate);

export const Tweet = mongoose.model("Tweet", tweetSchema);