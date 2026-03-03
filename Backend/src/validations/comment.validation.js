import { z } from "zod";

// Comment validation schemas

// Add Comment Schema
export const addCommentSchema = z.object({
    content: z.string()
        .min(1, "Comment content is required")
        .max(1000, "Comment must not exceed 1000 characters")
        .trim(),

    isStealthMode: z.union([
        z.boolean(),
        z.string()
    ]).optional()
}).strict();

// Update Comment Schema
export const updateCommentSchema = z.object({
    content: z.string()
        .min(1, "Comment content must not be empty")
        .max(1000, "Comment must not exceed 1000 characters")
        .trim()
        .optional(),

    isStealthMode: z.union([
        z.boolean(),
        z.string()
    ]).optional()
});
