import { z } from "zod";

/* ==========================================================================
   AUTHENTICATION VALIDATION SCHEMAS
   ========================================================================== */

// Register Request Schema
export const registerRequestSchema = z.object({
    fullName: z.string()
        .min(2, "Full name must be at least 2 characters")
        .max(50, "Full name must not exceed 50 characters")
        .trim(),

    email: z.string()
        .email("Invalid email address")
        .toLowerCase()
        .trim(),

    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must not exceed 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
        .toLowerCase()
        .trim(),

    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password must not exceed 100 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
});

// Verify OTP Schema
export const verifyOtpSchema = z.object({
    email: z.string().email("Invalid email address").toLowerCase().trim(),
    otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only numbers")
});

// Resend OTP Schema
export const resendOtpSchema = z.object({
    email: z.string().email("Invalid email address").toLowerCase().trim()
});

// Login Schema
export const loginSchema = z.object({
    identifier: z.string()
        .min(3, "Username or email is required")
        .trim(),

    password: z.string()
        .min(1, "Password is required")
});

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
    identifier: z.string()
        .min(3, "Username or email is required")
        .trim()
});

// Reset Password Schema
export const resetPasswordSchema = z.object({
    email: z.string().email("Invalid email address").toLowerCase().trim(),
    otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only numbers"),
    newPassword: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password must not exceed 100 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
});
