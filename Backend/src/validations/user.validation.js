import { z } from "zod";

/* ==========================================================================
   👤 USER PROFILE & SETTINGS VALIDATION SCHEMAS
   ========================================================================== */

// Update Profile Schema (all fields optional since partial updates allowed)
export const updateProfileSchema = z.object({
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must not exceed 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
        .toLowerCase()
        .trim()
        .optional(),

    fullName: z.string()
        .min(2, "Full name must be at least 2 characters")
        .max(50, "Full name must not exceed 50 characters")
        .trim()
        .optional(),

    bio: z.string()
        .max(300, "Bio must not exceed 300 characters")
        .trim()
        .optional(),

    avatarColor: z.string().optional(),
    coverColor: z.string().optional(),

    feedPreferences: z.union([
        z.array(z.string()),
        z.string()
    ]).optional()
}).strict();

// Update Privacy Settings Schema
export const updatePrivacySchema = z.object({
    isProfilePublic: z.boolean().optional(),
    isIdentityCloaked: z.boolean().optional()
}).strict();

// Change Password Schema
export const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z.string()
        .min(8, "New password must be at least 8 characters")
        .max(100, "New password must not exceed 100 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
}).strict();

// Search Users Schema
export const searchUsersSchema = z.object({
    query: z.string().min(1, "Search query is required").trim(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional()
});
