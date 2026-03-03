import { z } from "zod";

// Tweet validation schemas

// Create Tweet Schema
export const createTweetSchema = z.object({
    content: z.string()
        .min(1, "Tweet content is required")
        .max(500, "Tweet must not exceed 500 characters")
        .trim(),

    isPoll: z.union([
        z.boolean(),
        z.string()
    ]).optional(),

    pollQuestion: z.string()
        .max(200, "Poll question must not exceed 200 characters")
        .trim()
        .optional(),

    pollOptions: z.union([
        z.array(z.string()),
        z.string()
    ]).optional(),

    isStealthMode: z.union([
        z.boolean(),
        z.string()
    ]).optional()
});

// Update Tweet Schema
export const updateTweetSchema = z.object({
    content: z.string()
        .min(1, "Tweet content must not be empty")
        .max(500, "Tweet must not exceed 500 characters")
        .trim()
        .optional(),

    isStealthMode: z.union([
        z.boolean(),
        z.string()
    ]).optional()
});

// Vote on Poll Schema
export const voteOnPollSchema = z.object({
    optionIndex: z.number()
        .int("Option index must be an integer")
        .min(0, "Option index must be at least 0")
}).strict();
