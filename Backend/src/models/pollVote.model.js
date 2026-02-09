import mongoose, { Schema } from "mongoose";

const pollVoteSchema = new Schema({
    tweet: { type: Schema.Types.ObjectId, ref: "Tweet", required: true },
    voter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // We store the index of the option (0 to 9) instead of "A" or "B"
    optionIndex: { 
        type: Number, 
        required: true,
        min: 0,
        max: 9 
    }
}, { timestamps: true });

// Ensure one vote per user per tweet
pollVoteSchema.index({ tweet: 1, voter: 1 }, { unique: true });

export const PollVote = mongoose.model("PollVote", pollVoteSchema);