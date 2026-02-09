import { Router } from "express";
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    toggleSavePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";
import { restrictTo } from "../middlewares/auth.middleware.js";
import { createContentLimiter } from "../middlewares/rate-limiters/index.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createPlaylistSchema, updatePlaylistSchema } from "../validations/index.js";

const router = Router();

/* ==========================================================================
   🔓 PUBLIC ROUTES (View)
   Req.user is populated globally if logged in.
   Controllers use this to apply "Stealth Mode" and "Private Playlist" logic.
   ========================================================================== */
router.route("/user/:userId").get(getUserPlaylists);
router.route("/:playlistId").get(getPlaylistById);

/* ==========================================================================
   🔐 PROTECTED ROUTES (Manage)
   ========================================================================== */
router.use(restrictTo(["USER", "ADMIN"]));

router.route("/").post(createContentLimiter, validate(createPlaylistSchema), createPlaylist);

router
    .route("/:playlistId")
    .patch(validate(updatePlaylistSchema), updatePlaylist)
    .delete(deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

router.route("/save/:playlistId").post(toggleSavePlaylist);

export default router;