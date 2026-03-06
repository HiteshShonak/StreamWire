import crypto from "crypto";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { resolveIdentityMedia } from "../utils/identity.resolver.js";
import { saveTempUser, getTempUser, deleteTempUser } from "../utils/otp.service.js";
import { sendEmail } from "../utils/mail.js";
import { jwtService } from "../services/auth.service.js";
import { COOKIE_OPTIONS } from "../constants.js";
import { sanitizeUser } from "../utils/helper.js";

// Registration & OTP flow

export const registerRequest = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    if ([fullName, email, username, password].some(f => f?.trim() === "")) {
        throw new ApiError(400, "All fields (fullName, email, username, password) are required");
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.toLowerCase().trim();

    // 1. Check if user already exists in the main database
    const existingUser = await User.findOne({
        $or: [{ username: cleanUsername }, { email: cleanEmail }]
    });

    if (existingUser) {
        throw new ApiError(409, "A user with this username or email already exists");
    }

    // 2. Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // 3. Save to temporary storage (TTL handled by service)
    // We store the password here temporarily so we can create the user *after* verification
    saveTempUser(cleanEmail, {
        fullName,
        email: cleanEmail,
        username: cleanUsername,
        password,
        otp
    });

    // 4. Try sending OTP email — if SMTP is blocked (like on Render free tier), bypass OTP entirely
    try {
        await sendEmail(cleanEmail, otp, "VERIFY");

        return res.status(200).json(
            new ApiResponse(200, { email: cleanEmail, smtpBypassed: false }, "OTP sent successfully. Please verify to complete registration.")
        );
    } catch (smtpError) {
        // SMTP blocked — skip OTP and create the user directly
        console.error("SMTP blocked, bypassing OTP verification:", smtpError.message);

        const avatar = await resolveIdentityMedia({
            type: "avatar",
            username: cleanUsername,
            fullName
        });

        const coverImage = await resolveIdentityMedia({
            type: "cover",
            username: cleanUsername
        });

        const user = await User.create({
            fullName,
            username: cleanUsername,
            email: cleanEmail,
            password,
            avatar,
            coverImage
        });

        deleteTempUser(cleanEmail);

        // Auto-login
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        await user.addRefreshToken(refreshToken);

        const createdUser = sanitizeUser(user);

        return res
            .status(201)
            .cookie("accessToken", accessToken, COOKIE_OPTIONS)
            .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
            .json(
                new ApiResponse(
                    201,
                    { user: createdUser, accessToken, refreshToken, smtpBypassed: true },
                    "Account created successfully (email verification skipped)."
                )
            );
    }
});

export const verifyAndCreateUser = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const cleanEmail = email.toLowerCase().trim();
    const tempUser = getTempUser(cleanEmail);

    // 1. Validate OTP
    if (!tempUser || tempUser.otp !== otp) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    // 2. Identity Engine: Resolve Avatar & Cover (generates defaults if not uploaded)
    const avatar = await resolveIdentityMedia({
        type: "avatar",
        username: tempUser.username,
        fullName: tempUser.fullName
    });

    const coverImage = await resolveIdentityMedia({
        type: "cover",
        username: tempUser.username
    });

    // 3. Create the User in DB
    const user = await User.create({
        fullName: tempUser.fullName,
        username: tempUser.username,
        email: tempUser.email,
        password: tempUser.password, // Hashed automatically by pre-save hook
        avatar,
        coverImage
    });

    // 4. Cleanup Temp Store
    deleteTempUser(cleanEmail);

    // 5. Send Welcome Email (Non-blocking)
    try {
        await sendEmail(cleanEmail, null, "VERIFICATION_SUCCESS");
    } catch (emailError) {
        console.error("Welcome email failed to send:", emailError);
        // Do not throw error here, account is already created
    }

    // 6. Auto-Login: Generate Tokens immediately
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    await user.addRefreshToken(refreshToken); // Enforce 5-session limit

    const createdUser = sanitizeUser(user);

    return res
        .status(201)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS)
        .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
        .json(
            new ApiResponse(
                201,
                { user: createdUser, accessToken, refreshToken },
                "Account verified and created successfully!"
            )
        );
});

export const resendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const cleanEmail = email?.toLowerCase().trim();

    const tempUser = getTempUser(cleanEmail);
    if (!tempUser) {
        throw new ApiError(400, "Registration session expired. Please start the registration process again.");
    }

    const newOtp = crypto.randomInt(100000, 999999).toString();

    // Update existing temp record with new OTP
    saveTempUser(cleanEmail, { ...tempUser, otp: newOtp });

    await sendEmail(cleanEmail, newOtp, "VERIFY");

    return res.status(200).json(new ApiResponse(200, { email: cleanEmail }, "New OTP sent successfully."));
});

// Login flow

export const loginUser = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        throw new ApiError(400, "Username/Email and password are required");
    }

    const normalizedIdentifier = identifier.toLowerCase().trim();

    const user = await User.findOne({
        $or: [{ username: normalizedIdentifier }, { email: normalizedIdentifier }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    // Account Status Gates
    if (user.accountStatus === "DELETED_PENDING") {
        throw new ApiError(403, "This account is scheduled for deletion. Please contact support to restore.");
    }

    if (user.accountStatus === "BANNED") {
        throw new ApiError(403, "This account has been permanently suspended due to policy violations.");
    }

    // Verify Credentials
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    // Auto-Reactivation Logic
    let reactivated = false;
    if (user.accountStatus === "DEACTIVATED") {
        user.accountStatus = "ACTIVE";
        reactivated = true;
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Store refresh token (handles 5-device limit)
    await user.addRefreshToken(refreshToken);

    const loggedInUser = sanitizeUser(user);

    return res
        .status(200)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS)
        .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                    isReactivated: reactivated
                },
                reactivated ? "Welcome back! Your account has been successfully reactivated." : "User logged in successfully"
            )
        );
});

export const logoutUser = asyncHandler(async (req, res) => {
    // Graceful Logout: Handles potential race conditions during token rotation
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (req.user?._id && incomingRefreshToken) {
        // Only remove the specific token used for this session
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $pull: { refreshTokens: { token: incomingRefreshToken } }
            },
            { validateBeforeSave: false }
        );
    }

    return res
        .status(200)
        .clearCookie("accessToken", COOKIE_OPTIONS)
        .clearCookie("refreshToken", COOKIE_OPTIONS)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export const logoutAllSessions = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id);
    if (!user) throw new ApiError(404, "User not found");

    // Security: clears all tokens from DB
    user.refreshTokens = [];
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .clearCookie("accessToken", COOKIE_OPTIONS)
        .clearCookie("refreshToken", COOKIE_OPTIONS)
        .json(new ApiResponse(200, {}, "Logged out from all devices successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request: No refresh token provided");
    }

    // 1. Verify Signature (Stateless check first)
    const decodedToken = jwtService.verifyRefreshToken(incomingRefreshToken);
    if (!decodedToken) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    // 2. Fetch User
    const user = await User.findById(decodedToken?._id);
    if (!user) {
        throw new ApiError(401, "Invalid refresh token: User context missing");
    }

    // 3. Reuse Detection: Check if token exists in DB whitelist
    const isTokenValid = user.refreshTokens.some(t => t.token === incomingRefreshToken);
    if (!isTokenValid) {
        // If token is valid crypto-wise but missing from DB, it might be a reused token (theft attempt)
        // Advanced: You could trigger a `logoutAllSessions` here for safety
        throw new ApiError(401, "Refresh token is revoked or has been used already");
    }

    const accessToken = user.generateAccessToken();
    let newRefreshToken = incomingRefreshToken;

    // 4. Token rotation
    // Only issue a new Refresh Token if the old one is nearing expiry or policy dictates rotation
    if (jwtService.isTokenRotationNeeded(decodedToken)) {
        newRefreshToken = user.generateRefreshToken();

        // Remove the old used token
        user.refreshTokens = user.refreshTokens.filter(t => t.token !== incomingRefreshToken);

        // Add the new token (this call handles saving and limiting array size)
        await user.addRefreshToken(newRefreshToken);
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS)
        .cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken: newRefreshToken },
                "Access token refreshed successfully"
            )
        );
});

// Password recovery

export const forgotPasswordRequest = asyncHandler(async (req, res) => {
    const { identifier } = req.body;

    if (!identifier) {
        throw new ApiError(400, "Username or Email is required");
    }

    const normalizedIdentifier = identifier.toLowerCase().trim();

    const user = await User.findOne({
        $or: [
            { username: normalizedIdentifier },
            { email: normalizedIdentifier }
        ]
    });

    // Privacy: We technically shouldn't reveal if user exists, but for UX we usually do.
    if (!user) {
        throw new ApiError(404, "No account associated with this username or email");
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    saveTempUser(user.email, {
        email: user.email,
        otp,
        type: "PASSWORD_RESET" // Distinction from registration OTP
    });

    await sendEmail(user.email, otp, "RESET");

    return res.status(200).json(
        new ApiResponse(
            200,
            { email: user.email },
            "Password reset OTP sent to your registered email."
        )
    );
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        throw new ApiError(400, "Email, OTP, and new password are required");
    }

    const cleanEmail = email.toLowerCase().trim();
    const tempUser = getTempUser(cleanEmail);

    // Validate Context (Must be RESET type)
    if (!tempUser || tempUser.otp !== otp || tempUser.type !== "PASSWORD_RESET") {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
        throw new ApiError(404, "User no longer exists");
    }

    user.password = newPassword;

    // Security: Revoke all existing sessions 
    // User must log in again with new password.
    user.refreshTokens = [];

    await user.save({ validateBeforeSave: false });

    deleteTempUser(cleanEmail);

    // Alert user of change
    try {
        await sendEmail(cleanEmail, null, "PASSWORD_RESET_SUCCESS");
    } catch (err) {
        console.error("Failed to send password reset alert", err);
    }

    return res
        .status(200)
        .clearCookie("accessToken", COOKIE_OPTIONS)
        .clearCookie("refreshToken", COOKIE_OPTIONS)
        .json(
            new ApiResponse(
                200,
                {},
                "Password reset successfully. Please login with your new credentials."
            )
        );
});