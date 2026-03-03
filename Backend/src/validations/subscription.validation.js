import { z } from "zod";

// Subscription validation schemas

// Manage Subscription Request Schema
export const manageRequestSchema = z.object({
    action: z.enum(["ACCEPT", "REJECT"], {
        errorMap: () => ({ message: "Action must be either ACCEPT or REJECT" })
    })
}).strict();
