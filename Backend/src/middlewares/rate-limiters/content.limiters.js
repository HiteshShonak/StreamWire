import rateLimit from "express-rate-limit";

// Content creation rate limiters

// Heavy uploads (videos) - stricter limit
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 uploads per hour
    message: {
        success: false,
        message: "Upload limit reached. You can upload 50 videos per hour."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// General content creation (tweets, comments, playlists)
export const createContentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 items per 15 minutes
    message: {
        success: false,
        message: "You're creating content too fast. Please slow down."
    },
    standardHeaders: true,
    legacyHeaders: false,
});
