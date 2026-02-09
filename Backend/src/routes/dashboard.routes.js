import { Router } from "express";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";
import { restrictTo } from "../middlewares/auth.middleware.js";

const router = Router();

/* ==========================================================================
   🔐 PROTECTED ROUTES (Owner Dashboard)
   All dashboard routes require a logged-in user.
   ========================================================================== */
router.use(restrictTo(["USER", "ADMIN"]));

// Get the big numbers (Views, Subs, Likes)
router.route("/stats").get(getChannelStats);

// Get the management list (Table view with Edit/Delete options)
router.route("/videos").get(getChannelVideos);

export default router;