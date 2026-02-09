import { Router } from "express";
import {
    getWatchHistory,
    updateWatchProgress,
    getWatchLater,
    getLikedVideos,
    getSavedPlaylists,
    toggleWatchLater,
    checkWatchLater
} from "../controllers/library.controller.js";
import { restrictTo } from "../middlewares/auth.middleware.js";

const router = Router();

/* ==========================================================================
   🔐 PROTECTED ROUTES (Personal Library)
   ========================================================================== */
router.use(restrictTo(["USER", "ADMIN"]));

router.route("/history").get(getWatchHistory);
router.route("/history/:videoId").patch(updateWatchProgress); // Update watch progress
router.route("/watch-later").get(getWatchLater);
router.route("/watch-later/:videoId").post(toggleWatchLater).get(checkWatchLater);
router.route("/liked-videos").get(getLikedVideos);
router.route("/playlists").get(getSavedPlaylists);

export default router;