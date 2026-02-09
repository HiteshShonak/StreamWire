import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const historySchema = new Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    lastPosition: {
        type: Number, 
        default: 0
    },
    watchedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

historySchema.index({ owner: 1, watchedAt: -1 });

historySchema.index({ owner: 1, video: 1 });

historySchema.plugin(mongooseAggregatePaginate);

export const History = mongoose.model("History", historySchema);