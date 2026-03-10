import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { jwtService } from "../services/auth.service.js";

export const authenticate = asyncHandler(async (req, _, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        req.user = null;
        return next();
    }

    const decodedToken = jwtService.verifyAccessToken(token);
    if (!decodedToken) {
        req.user = null;
        return next();
    }

    const user = await User.findById(decodedToken._id).select("-password -refreshTokens");

    // token was issued before a logout-all or password reset — reject it
    if (user && decodedToken.tokenVersion !== undefined && decodedToken.tokenVersion !== user.tokenVersion) {
        req.user = null;
        return next();
    }

    req.user = user || null;
    next();
});

export const restrictTo = (roles = []) => {
    return (req, _, next) => {
        if (!req.user) {
            if (roles.includes("GUEST")) return next();
            throw new ApiError(401, "Please log in to access this resource");
        }

        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, "You do not have permission to perform this action");
        }

        next();
    };
};