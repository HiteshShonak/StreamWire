import rateLimit from "express-rate-limit";

/* ==========================================================================
   AUTHENTICATION RATE LIMITERS
   Protect auth endpoints from brute force attacks
   ========================================================================== */

// Strict limiter for login attempts
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        success: false,
        message: "Too many login attempts. Please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// General limiter for auth operations (register, verify-otp, reset-password)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        success: false,
        message: "Too many attempts. Please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter limiter for OTP resend (prevent spam)
export const otpResendLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Only 3 resends per window
    message: {
        success: false,
        message: "Too many OTP requests. Please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Password reset request limiter
export const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // 3 attempts per window
    message: {
        success: false,
        message: "Too many password reset attempts. Please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});
