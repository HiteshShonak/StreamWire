import { z } from "zod";

/* ==========================================================================
   📂 PLAYLIST VALIDATION SCHEMAS
   ========================================================================== */

// Create Playlist Schema
export const createPlaylistSchema = z.object({
    name: z.string()
        .min(1, "Playlist name is required")
        .max(100, "Playlist name must not exceed 100 characters")
        .trim(),

    description: z.string()
        .max(500, "Description must not exceed 500 characters")
        .trim()
        .optional(),

    isPublic: z.union([
        z.boolean(),
        z.string()
    ]).optional(),

    isStealthMode: z.union([
        z.boolean(),
        z.string()
    ]).optional()
});

// Update Playlist Schema
export const updatePlaylistSchema = z.object({
    name: z.string()
        .min(1, "Playlist name must not be empty")
        .max(100, "Playlist name must not exceed 100 characters")
        .trim()
        .optional(),

    description: z.string()
        .max(500, "Description must not exceed 500 characters")
        .trim()
        .optional(),

    isPublic: z.union([
        z.boolean(),
        z.string()
    ]).optional(),

    isStealthMode: z.union([
        z.boolean(),
        z.string()
    ]).optional()
});
