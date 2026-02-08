import { Router } from "express";
import {
    addVideoComment,
    addTweetComment,
    deleteComment,
    getVideoComments,
    getTweetComments,
    updateComment,
    togglePinComment,
    getPinnedComments
} from "../controllers/comment.controller.js";
import { restrictTo } from "../middlewares/auth.middleware.js";
import { createContentLimiter } from "../middlewares/rate-limiters/index.js";
import { validate } from "../middlewares/validate.middleware.js";
import { addCommentSchema, updateCommentSchema } from "../validations/index.js";

const router = Router();

/* ==========================================================================
   🔓 PUBLIC ROUTES (View)
   ========================================================================== */
// Video Comments
router.route("/v/:videoId").get(getVideoComments);

// Tweet Comments (The Wire)
router.route("/t/:tweetId").get(getTweetComments);

// Get Pinned Comments for a Video
router.route("/v/:videoId/pinned").get(getPinnedComments);

/* ==========================================================================
   🔐 PROTECTED ROUTES (Interact)
   ========================================================================== */
router.use(restrictTo(["USER", "ADMIN"]));

// Add Comment (Video) - WITH RATE LIMITING
router.route("/v/:videoId").post(createContentLimiter, validate(addCommentSchema), addVideoComment);

// Add Comment (Tweet) - WITH RATE LIMITING
router.route("/t/:tweetId").post(createContentLimiter, validate(addCommentSchema), addTweetComment);

// Edit/Delete (Universal - Logic handled in controller)
router
    .route("/c/:commentId")
    .patch(validate(updateCommentSchema), updateComment)
    .delete(deleteComment);

// Pin/Unpin Comment (Video owner only)
router.route("/v/:videoId/pin/:commentId").post(togglePinComment);

export default router;