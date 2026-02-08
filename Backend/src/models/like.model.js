import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const likeSchema = new Schema(
  {
    video: { type: Schema.Types.ObjectId, ref: "Video" },
    tweet: { type: Schema.Types.ObjectId, ref: "Tweet" },
    comment: { type: Schema.Types.ObjectId, ref: "Comment" },
    likedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isStealthMode: { type: Boolean, default: false } // ✅ Added missing field
  },
  { timestamps: true }
);

// 🛡️ Integrity Check: Ensure 1 like = 1 target
// 🟢 OPTIMIZED: Synchronous check using 'throw' (No 'next' needed)
likeSchema.pre("save", function () {
  const fields = [this.video, this.tweet, this.comment].filter(Boolean);

  if (fields.length !== 1) {
      throw new Error("A like must belong to exactly one entity (Video, Tweet, or Comment)");
  }
});

// 🛡️ Compound Indexes: Prevent duplicate likes on the same item
likeSchema.index({ video: 1, likedBy: 1 }, { unique: true, sparse: true });
likeSchema.index({ tweet: 1, likedBy: 1 }, { unique: true, sparse: true });
likeSchema.index({ comment: 1, likedBy: 1 }, { unique: true, sparse: true });

likeSchema.plugin(mongooseAggregatePaginate);

export const Like = mongoose.model("Like", likeSchema);