import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const likeSchema = new Schema(
  {
    video: { type: Schema.Types.ObjectId, ref: "Video" },
    tweet: { type: Schema.Types.ObjectId, ref: "Tweet" },
    comment: { type: Schema.Types.ObjectId, ref: "Comment" },
    likedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isStealthMode: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Keep one like tied to one target.
likeSchema.pre("save", function () {
  const fields = [this.video, this.tweet, this.comment].filter(Boolean);

  if (fields.length !== 1) {
    throw new Error("A like must belong to exactly one entity (Video, Tweet, or Comment)");
  }
});

// Prevent duplicate likes per target and user.
likeSchema.index(
  { video: 1, likedBy: 1 },
  {
    name: "uniq_like_video_per_user",
    unique: true,
    partialFilterExpression: {
      video: { $exists: true, $type: "objectId" },
      likedBy: { $exists: true, $type: "objectId" }
    }
  }
);

likeSchema.index(
  { tweet: 1, likedBy: 1 },
  {
    name: "uniq_like_tweet_per_user",
    unique: true,
    partialFilterExpression: {
      tweet: { $exists: true, $type: "objectId" },
      likedBy: { $exists: true, $type: "objectId" }
    }
  }
);

likeSchema.index(
  { comment: 1, likedBy: 1 },
  {
    name: "uniq_like_comment_per_user",
    unique: true,
    partialFilterExpression: {
      comment: { $exists: true, $type: "objectId" },
      likedBy: { $exists: true, $type: "objectId" }
    }
  }
);

likeSchema.plugin(mongooseAggregatePaginate);

export const Like = mongoose.model("Like", likeSchema);