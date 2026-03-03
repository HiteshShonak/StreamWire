import { Router } from "express";
import {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
} from "../controllers/like.controller.js";
import { restrictTo } from "../middlewares/auth.middleware.js";

const router = Router();

// Protected routes
router.use(restrictTo(["USER", "ADMIN"]));

// 1. Toggle Video Like (The Cinema)
// Returns: { isLiked: true/false }
router.route("/toggle/v/:videoId").post(toggleVideoLike);

// 2. Toggle Comment Like (Cinema & Wire)
// Returns: { isLiked: true/false }
router.route("/toggle/c/:commentId").post(toggleCommentLike);

// 3. Toggle Tweet Like (The Wire / Shadows)
// Returns: { isLiked: true/false }
router.route("/toggle/t/:tweetId").post(toggleTweetLike);

export default router;