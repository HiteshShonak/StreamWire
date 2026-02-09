import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const subscriptionSchema = new Schema(
  {
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["PENDING", "ACCEPTED"],
        default: "ACCEPTED",
        index: true, 
    },
    notificationMode: {
        type: String,
        enum: ["ALL", "PERSONALIZED", "NONE"],
        default: "ALL",
    },
    tier: {
        type: String,
        enum: ["FREE", "SILVER", "GOLD", "PLATINUM"],
        default: "FREE",
    },
    source: {
        type: String,
        enum: ["VIDEO_PAGE", "CHANNEL_PAGE", "SEARCH", "SHORTS", "OTHER"],
        default: "VIDEO_PAGE",
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });
subscriptionSchema.index({ channel: 1, status: 1, createdAt: -1 });

subscriptionSchema.plugin(mongooseAggregatePaginate);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);