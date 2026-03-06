import rateLimit from "express-rate-limit";

// Contact form rate limiter

export const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 9, // 9 messages per window
    message: {
        success: false,
        message: "Too many messages sent. Please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});
