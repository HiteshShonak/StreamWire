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

/* ==========================================================================
   ACTION ROUTES (Login Required)
   ========================================================================== */
// We use a specific router stack for protected actions
router.route("/c/:channelId").post(restrictTo(["USER", "ADMIN"]), toggleSubscription);
router.route("/requests/:requestId").patch(restrictTo(["USER", "ADMIN"]), manageRequest);
router.route("/requests").get(restrictTo(["USER", "ADMIN"]), getPendingRequests);


/* ==========================================================================
   VIEW ROUTES (Publicly Visible Lists)
   Req.user is populated globally for stealth masking logic
   ========================================================================== */
// The "Fans" List
router.route("/c/:channelId").get(getUserSubscriberList);

// The "Following" List (Protected inside controller if private)
router.route("/u/:subscriberId").get(getSubscribedChannels);

export default router;