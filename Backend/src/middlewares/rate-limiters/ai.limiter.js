import rateLimit from "express-rate-limit";

// AI API rate limiter (protect expensive AI endpoints, Groq has rate limits)

export const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 50, // 50 requests per minute
    message: {
        success: false,
        message: "Too many AI requests. Please wait a moment before trying again."
    },
    standardHeaders: true,
    legacyHeaders: false,
});
