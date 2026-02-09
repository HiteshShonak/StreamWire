import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const savedPlaylistSchema = new Schema({
    playlist: {
        type: Schema.Types.ObjectId,
        ref: "Playlist",
        required: true
    },
    savedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

savedPlaylistSchema.index({ playlist: 1, savedBy: 1 }, { unique: true });

savedPlaylistSchema.plugin(mongooseAggregatePaginate);

export const SavedPlaylist = mongoose.model("SavedPlaylist", savedPlaylistSchema);