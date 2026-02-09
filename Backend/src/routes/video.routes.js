import { Router } from "express";
import {
    publishAVideo,
    getVideoById,
    getAllVideos,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    generateVideoSummary,
    askQuestionAboutVideo
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { restrictTo } from "../middlewares/auth.middleware.js";
import { aiLimiter, uploadLimiter } from "../middlewares/rate-limiters/index.js";
import { validate } from "../middlewares/validate.middleware.js";
import { publishVideoSchema, updateVideoSchema, askQuestionSchema } from "../validations/index.js";

const router = Router();

/* ==========================================================================
   🔓 PUBLIC ROUTES (With Stealth/Privacy logic)
   Req.user is populated globally.
   ========================================================================== */
router.route("/").get(getAllVideos);
router.route("/v/:videoId").get(getVideoById);

// 🤖 AI Features (Public - anyone can summarize or ask questions) - WITH RATE LIMITING
router.route("/v/:videoId/summarize").post(aiLimiter, generateVideoSummary);
router.route("/v/:videoId/ask").post(aiLimiter, validate(askQuestionSchema), askQuestionAboutVideo);


/* ==========================================================================
   🔐 PROTECTED ROUTES (Creator Tools)
   ========================================================================== */
router.use(restrictTo(["USER", "ADMIN"]));

router.route("/publish").post(
    uploadLimiter,
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    validate(publishVideoSchema),
    publishAVideo
);

router
    .route("/v/:videoId")
    .patch(upload.single("thumbnail"), validate(updateVideoSchema), updateVideo)
    .delete(deleteVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;