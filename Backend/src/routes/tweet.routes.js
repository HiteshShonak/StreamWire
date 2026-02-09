import { Router } from "express";
import {
    createTweet,
    deleteTweet,
    getAllTweets,
    getUserTweets,
    getTweetById,
    updateTweet,
    voteOnPoll
} from "../controllers/tweet.controller.js";
import { restrictTo } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { createContentLimiter } from "../middlewares/rate-limiters/index.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createTweetSchema, updateTweetSchema, voteOnPollSchema } from "../validations/index.js";

const router = Router();

/* ==========================================================================
   🌍 FEED ROUTES (View)
   ========================================================================== */
router.route("/").get(getAllTweets);
router.route("/user/:userId").get(getUserTweets);

/* ==========================================================================
   🔐 PROTECTED ROUTES (Create/Edit/Vote)
   ========================================================================== */

// Note: restrictTo checks for role, but verifyJWT (implicit in app.js or auth middleware) 
// populates req.user. If you need this route open to public (unlogged users), 
// you might need to relax middleware, but for now assuming logged-in access for interaction.

router.route("/").post(restrictTo(["USER", "ADMIN"]), createContentLimiter, upload.single("image"), validate(createTweetSchema), createTweet);

// ⚡ SINGLE TWEET OPERATIONS
router.route("/:tweetId")
    .get(getTweetById)
    .patch(restrictTo(["USER", "ADMIN"]), validate(updateTweetSchema), updateTweet)
    .delete(restrictTo(["USER", "ADMIN"]), deleteTweet);

router.route("/vote/:tweetId").post(restrictTo(["USER", "ADMIN"]), validate(voteOnPollSchema), voteOnPoll);

export default router;