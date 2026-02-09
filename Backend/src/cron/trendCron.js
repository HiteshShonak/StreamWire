import cron from "node-cron";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import { updateVideoTrendScore, updateTweetTrendScore } from "../utils/trendScore.js";


const runUpdateTask = async () => {
    console.log("[Cron] Starting TrendScore Update...");
    
    try {
        // 1. Update Videos
        const videos = await Video.find({ isPublished: true }).select('_id');
        console.log(`[Cron] Found ${videos.length} videos to update.`);
        
        let vCount = 0;
        for (const video of videos) {
            await updateVideoTrendScore(video._id);
            vCount++;
        }
        console.log(`[Cron] Successfully updated ${vCount} videos.`);

        // 2. Update Tweets
        const tweets = await Tweet.find({}).select('_id');
        console.log(`[Cron] Found ${tweets.length} tweets to update.`);
        
        let tCount = 0;
        for (const tweet of tweets) {
            await updateTweetTrendScore(tweet._id);
            tCount++;
        }
        console.log(`[Cron] Successfully updated ${tCount} tweets.`);
        
        console.log("[Cron] Update process finished.");

    } catch (error) {
        console.error("[Cron] Error during update:", error.message);
    }
};

export const initTrendCron = () => {
    runUpdateTask();

    cron.schedule("0 0 * * *", () => {
        runUpdateTask();
    });
};