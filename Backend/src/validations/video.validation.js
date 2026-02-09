import { z } from "zod";

/* ==========================================================================
   📹 VIDEO VALIDATION SCHEMAS
   ========================================================================== */

// Publish Video Schema
export const publishVideoSchema = z.object({
    title: z.string()
        .min(1, "Title is required")
        .max(100, "Title must not exceed 100 characters")
        .trim(),

    description: z.string()
        .max(5000, "Description must not exceed 5000 characters")
        .trim()
        .optional(),

    tags: z.union([
        z.array(z.string()),
        z.string()
    ]).optional(),

    isStealthMode: z.union([
        z.boolean(),
        z.string()
    ]).optional()
});

// Update Video Schema
export const updateVideoSchema = z.object({
    title: z.string()
        .min(1, "Title must not be empty")
        .max(100, "Title must not exceed 100 characters")
        .trim()
        .optional(),

    description: z.string()
        .max(5000, "Description must not exceed 5000 characters")
        .trim()
        .optional(),

    tags: z.union([
        z.array(z.string()),
        z.string()
    ]).optional(),

    isStealthMode: z.union([
        z.boolean(),
        z.string()
    ]).optional()
});

// Ask Question About Video Schema
export const askQuestionSchema = z.object({
    question: z.string()
        .min(1, "Question is required")
        .max(500, "Question must not exceed 500 characters")
        .trim(),

    conversationHistory: z.array(
        z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string()
        })
    ).optional()
}).strict();
