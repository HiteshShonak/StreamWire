import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";


const calculateRecencyBoost = (createdAt) => {
    const MAX_BOOST = 100;
    const MAX_DAYS = 30;

    const now = new Date();
    const created = new Date(createdAt);
    const daysSinceCreation = (now - created) / (1000 * 60 * 60 * 24);

    if (daysSinceCreation < MAX_DAYS) {
        return (MAX_DAYS - daysSinceCreation) * (MAX_BOOST / MAX_DAYS);
    }
    return 0;
};


export const updateVideoTrendScore = async (videoId) => {
    try {
        const video = await Video.findById(videoId);
        if (!video) return 0;

        const [likesCount, commentsCount] = await Promise.all([
            Like.countDocuments({ video: videoId }),
            Comment.countDocuments({ video: videoId })
        ]);

        const recencyBoost = calculateRecencyBoost(video.createdAt);

        const trendScore =
            (video.views * 1) +
            (likesCount * 10) +
            (commentsCount * 20) +
            recencyBoost;

        await Video.findByIdAndUpdate(videoId, { trendScore: Math.round(trendScore) });

        return Math.round(trendScore);
    } catch (error) {
        console.error(`Failed to update video trendScore for ${videoId}:`, error.message);
        return 0;
    }
};


export const updateTweetTrendScore = async (tweetId) => {
    try {
        const tweet = await Tweet.findById(tweetId);
        if (!tweet) return 0;

        const [likesCount, commentsCount] = await Promise.all([
            Like.countDocuments({ tweet: tweetId }),
            Comment.countDocuments({ tweet: tweetId })
        ]);

        let pollVotes = 0;
        if (tweet.poll?.options) {
            pollVotes = tweet.poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
        }

        const recencyBoost = calculateRecencyBoost(tweet.createdAt);

        const trendScore =
            ((tweet.views || 0) * 1) +
            (likesCount * 10) +
            (commentsCount * 20) +
            (pollVotes * 5) +
            recencyBoost;

        await Tweet.findByIdAndUpdate(tweetId, { trendScore: Math.round(trendScore) });

        return Math.round(trendScore);
    } catch (error) {
        console.error(`Failed to update tweet trendScore for ${tweetId}:`, error.message);
        return 0;
    }
};
