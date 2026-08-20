import cron from "node-cron";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary inactivity policy: free-tier accounts can be wiped if dormant
// for an extended period (typically 90–180 days) with or without notice.
// This cron fires on the 1st of every month at 9 AM and makes a lightweight
// API call (fetch 1 resource) — enough to register activity and keep the
// account alive in Cloudinary's systems.

const pingCloudinary = async () => {
    console.log("[Cron] Pinging Cloudinary to prevent inactivity deletion...");

    try {
        // Fetching just 1 resource — minimal bandwidth, sufficient API activity
        const result = await cloudinary.api.resources({ max_results: 1 });
        const totalAssets = result.rate_limit_remaining !== undefined
            ? `(rate limit remaining: ${result.rate_limit_remaining})`
            : "";
        console.log(`[Cron] Cloudinary ping successful — account kept active ${totalAssets}`);
    } catch (error) {
        // Log but don't crash the server — this is a background keep-alive task
        console.error("[Cron] Cloudinary ping failed:", error.message);
    }
};

export const initCloudinaryKeepAliveCron = () => {
    // Run immediately on startup so the first ping doesn't wait a full month
    pingCloudinary();

    // Then run on the 1st of every month at 09:00 AM
    cron.schedule("0 9 1 * *", () => {
        pingCloudinary();
    });

    console.log("[Cron] Cloudinary keep-alive cron scheduled (runs 1st of every month)");
};
