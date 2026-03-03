import mongoose from "mongoose";
import { History } from "../models/history.model.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";

/**
 * Build User Feed from Watch History
 * Looks at user's watch history and grabs top 20 tags
 * @param {string} userId - User ID
 * @returns {Promise<string[]>} Array of top 20 tags
 */
export const buildUserFeed = async (userId) => {
    try {
        console.log('Building feed for user:', userId);

        // Get user's watch history (last 100 videos)
        const history = await History.find({ owner: userId })
            .sort({ watchedAt: -1 })
            .limit(100)
            .populate('video', 'tags')
            .lean();


        if (!history.length) {
            console.log('No watch history found');
            return [];
        }

        // Extract and count tag frequency
        const tagFrequency = {};

        history.forEach(entry => {
            if (entry.video?.tags && Array.isArray(entry.video.tags)) {
                entry.video.tags.forEach(tag => {
                    if (tag && tag.trim()) {
                        const normalizedTag = tag.trim();
                        tagFrequency[normalizedTag] = (tagFrequency[normalizedTag] || 0) + 1;
                    }
                });
            }
        });


        // Sort by frequency and take top 20
        const sortedTags = Object.entries(tagFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([tag]) => tag);

        console.log('Sorted tags (top 20):', sortedTags);

        // Update user's feedPreferences
        await User.findByIdAndUpdate(userId, { feedPreferences: sortedTags });
        console.log('Updated user feedPreferences');

        return sortedTags;
    } catch (error) {
        console.error('Error building user feed:', error);
        return [];
    }
};

/**
 * Update Feed Incrementally on Video Watch
 * @param {string} userId - User ID
 * @param {string[]} videoTags - Tags from the watched video
 */
export const updateFeedOnWatch = async (userId, videoTags) => {
    try {
        if (!videoTags || !Array.isArray(videoTags) || videoTags.length === 0) {
            return;
        }

        const user = await User.findById(userId);
        if (!user) return;

        let currentFeed = user.feedPreferences || [];
        let hasChanges = false;

        // Add new tags from watched video to feed (if not already present)
        videoTags.forEach(tag => {
            const normalizedTag = tag.trim();
            if (normalizedTag && !currentFeed.includes(normalizedTag)) {
                currentFeed.push(normalizedTag);
                hasChanges = true;
            }
        });

        // If feed exceeds 20, rebuild from history for proper ranking
        if (currentFeed.length > 20) {
            currentFeed = await buildUserFeed(userId);
            hasChanges = true;
        }

        // Save if there are changes
        if (hasChanges) {
            user.feedPreferences = currentFeed.slice(0, 20);
            await user.save();
        }
    } catch (error) {
        console.error('Error updating feed on watch:', error);
    }
};

/**
 * Get Recommended Videos for User
 * Get videos that match user's feed tags
 * @param {string} userId - User ID
 * @param {number} limit - Number of videos to fetch
 * @returns {Promise<Array>} Array of recommended videos
 */
export const getRecommendedVideos = async (userId, limit = 20) => {
    try {
        const user = await User.findById(userId);
        if (!user || !user.feedPreferences || user.feedPreferences.length === 0) {
            // No feed tags, return empty or popular videos
            return [];
        }

        // Find videos with tags matching user's feed
        const videos = await Video.aggregate([
            {
                $match: {
                    tags: { $in: user.feedPreferences },
                    isPublished: true
                }
            },
            // Calculate relevance score based on tag matches
            {
                $addFields: {
                    relevanceScore: {
                        $size: {
                            $setIntersection: ["$tags", user.feedPreferences]
                        }
                    }
                }
            },
            // Sort by relevance first, then by recency
            { $sort: { relevanceScore: -1, createdAt: -1 } },
            { $limit: limit }
        ]);

        return videos;
    } catch (error) {
        console.error('Error getting recommended videos:', error);
        return [];
    }
};

/**
 * Get All Available Tags
 * Get all unique tags from published videos
 * @returns {Promise<string[]>} Array of all tags
 */
export const getAllTags = async () => {
    try {
        const tags = await Video.distinct('tags', { isPublished: true });
        return tags.filter(tag => tag && tag.trim()).sort();
    } catch (error) {
        console.error('Error getting all tags:', error);
        return [];
    }
};

/**
 * Get Popular Tags
 * Grabs unique tags from the top 10 trending videos (max 2 tags per video)
 * This way popular tags come from content people actually watch
 * @param {number} limit - Max number of tags to return
 * @returns {Promise<Array>} Array of {tag, count}
 */
export const getPopularTags = async (limit = 20) => {
    try {
        // Get top 10 trending videos
        const trendingVideos = await Video.find({ isPublished: true })
            .sort({ trendScore: -1 })
            .limit(10)
            .select('tags title')
            .lean();

        if (!trendingVideos.length) {
            return [];
        }

        // Collect tags with frequency count
        const tagCount = {};

        trendingVideos.forEach(video => {
            if (video.tags && Array.isArray(video.tags)) {
                // Take max 2 tags per video
                const videoTags = video.tags.slice(0, 2);
                videoTags.forEach(tag => {
                    if (tag && tag.trim()) {
                        const normalizedTag = tag.trim();
                        tagCount[normalizedTag] = (tagCount[normalizedTag] || 0) + 1;
                    }
                });
            }
        });

        // Convert to array and sort by frequency
        const result = Object.entries(tagCount)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);

        return result;
    } catch (error) {
        console.error('Error getting popular tags:', error);
        return [];
    }
};
