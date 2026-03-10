import { ANONYMOUS_USER_NAME } from "../constants.js";

export const sanitizeUser = (user) => {
    const userObj = user.toObject();
    const sensitiveFields = ['password', 'refreshTokens', 'tokenVersion', 'otp', 'otpExpiry', '__v'];
    sensitiveFields.forEach(field => delete userObj[field]);
    return userObj;
};


// Identity masking aggregation stage
export const maskIdentityStage = () => {
    return {
        $addFields: {
            "owner.fullName": {
                $cond: {
                    if: {
                        $or: [
                            { $eq: ["$owner.isIdentityCloaked", true] },
                            { $eq: ["$isStealthMode", true] }
                        ]
                    },
                    then: ANONYMOUS_USER_NAME,
                    else: "$owner.fullName"
                }
            },
            "owner.username": {
                $cond: {
                    if: {
                        $or: [
                            { $eq: ["$owner.isIdentityCloaked", true] },
                            { $eq: ["$isStealthMode", true] }
                        ]
                    },
                    then: "anonymous",
                    else: "$owner.username"
                }
            },
            "owner.avatar.url": {
                $cond: {
                    if: {
                        $or: [
                            { $eq: ["$owner.isIdentityCloaked", true] },
                            { $eq: ["$isStealthMode", true] }
                        ]
                    },
                    then: "https://ui-avatars.com/api/?name=S&background=18181b&color=22c55e",
                    else: "$owner.avatar.url"
                }
            }
        }
    };
};