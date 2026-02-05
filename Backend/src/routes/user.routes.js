import { Router } from "express";
import {
    registerRequest,
    verifyAndCreateUser,
    resendOtp,
    loginUser,
    refreshAccessToken,
    forgotPasswordRequest,
    resetPassword,
    logoutUser,
    logoutAllSessions
} from "../controllers/auth.controller.js";
import {
    changeCurrentPassword,
    deactivateAccount,
    updateProfile,
    getCurrentUser,
    getUserChannelProfile,
    updatePrivacySettings,
    searchUsers,
    getForYouFeed,
    getFeedPreferences,
    updateFeedPreferences,
    buildFeedFromHistory,
    getAllAvailableTags,
    getPopularTagsList
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { restrictTo } from "../middlewares/auth.middleware.js";
import { ApiError } from "../utils/ApiError.js";
import {
    loginLimiter,
    authLimiter,
    otpResendLimiter,
    passwordResetLimiter
} from "../middlewares/rate-limiters/index.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    registerRequestSchema,
    verifyOtpSchema,
    resendOtpSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updateProfileSchema,
    updatePrivacySchema,
    changePasswordSchema
} from "../validations/index.js";

const router = Router();

// Middleware to prevent authenticated users from accessing auth routes
const preventLoggedIn = (req, res, next) => {
    // Check global req.user (populated by your global middleware)
    if (req.user) {
        throw new ApiError(403, "Forbidden: You are already logged in.");
    }
    next();
};

/* ==========================================================================
   🔓 PUBLIC AUTH ROUTES (With Rate Limiting)
   ========================================================================== */
router.route("/register-request").post(authLimiter, validate(registerRequestSchema), preventLoggedIn, registerRequest);
router.route("/verify-otp").post(authLimiter, validate(verifyOtpSchema), preventLoggedIn, verifyAndCreateUser);
router.route("/resend-otp").post(otpResendLimiter, validate(resendOtpSchema), preventLoggedIn, resendOtp);

router.route("/login").post(loginLimiter, validate(loginSchema), preventLoggedIn, loginUser);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/forgot-password").post(passwordResetLimiter, validate(forgotPasswordSchema), preventLoggedIn, forgotPasswordRequest);
router.route("/reset-password").post(authLimiter, validate(resetPasswordSchema), preventLoggedIn, resetPassword);

/* ==========================================================================
   🔓 PUBLIC PROFILE ROUTES
   Req.user is already available here thanks to global middleware!
   ========================================================================== */
router.route("/c/:username").get(getUserChannelProfile);
router.route("/search").get(searchUsers);


/* ==========================================================================
   🔐 PROTECTED USER ROUTES
   Global middleware populates user, restrictTo ensures they exist.
   ========================================================================== */
router.use(restrictTo(["USER", "ADMIN"]));

router.route("/logout").post(logoutUser);
router.route("/logout-all").post(logoutAllSessions);

router.route("/me").get(getCurrentUser);
router.route("/change-password").patch(validate(changePasswordSchema), changeCurrentPassword);
router.route("/deactivate").patch(deactivateAccount);

router.route("/toggle-privacy").patch(validate(updatePrivacySchema), updatePrivacySettings);

router.route("/update-profile").patch(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    validate(updateProfileSchema),
    updateProfile
);

// 🎯 Feed Routes
router.route("/feed/for-you").get(getForYouFeed);
router.route("/feed/preferences").get(getFeedPreferences);
router.route("/feed/preferences").patch(updateFeedPreferences);
router.route("/feed/build").post(buildFeedFromHistory);
router.route("/feed/tags").get(getAllAvailableTags);
router.route("/feed/tags/popular").get(getPopularTagsList);

export default router;