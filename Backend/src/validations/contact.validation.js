import { z } from "zod";

// Contact validation schema

export const contactFormSchema = z.object({
    name: z.string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must not exceed 100 characters")
        .trim(),

    email: z.string()
        .email("Please provide a valid email address")
        .toLowerCase()
        .trim(),

    subject: z.string()
        .min(5, "Subject must be at least 5 characters")
        .max(200, "Subject must not exceed 200 characters")
        .trim(),

    message: z.string()
        .min(20, "Message must be at least 20 characters")
        .max(2000, "Message must not exceed 2000 characters")
        .trim()
}).strict();
