import { Router } from "express";
import {
   getSubscribedChannels,
   getUserSubscriberList,
   toggleSubscription,
   getPendingRequests,
   manageRequest
} from "../controllers/subscription.controller.js";
import { restrictTo } from "../middlewares/auth.middleware.js";

const router = Router();

// Action routes (Login Required)
// We use a specific router stack for protected actions
router.route("/c/:channelId").post(restrictTo(["USER", "ADMIN"]), toggleSubscription);
router.route("/requests/:requestId").patch(restrictTo(["USER", "ADMIN"]), manageRequest);
router.route("/requests").get(restrictTo(["USER", "ADMIN"]), getPendingRequests);


// Public routes (read-only)
// The "Fans" List
router.route("/c/:channelId").get(getUserSubscriberList);

// The "Following" List (Protected inside controller if private)
router.route("/u/:subscriberId").get(getSubscribedChannels);

export default router;