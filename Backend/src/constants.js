export const DB_NAME = "StreamWire";

export const MAX_VIDEO_UPLOAD_MB = 100;
export const MAX_VIDEO_UPLOAD_BYTES = MAX_VIDEO_UPLOAD_MB * 1024 * 1024;
export const MAX_THUMBNAIL_UPLOAD_MB = 5;
export const MAX_THUMBNAIL_UPLOAD_BYTES = MAX_THUMBNAIL_UPLOAD_MB * 1024 * 1024;
export const VIDEO_COMPRESSION_TARGET_MB = 50;

// cross-origin check (vercel + render = diff domains)
const isProduction = process.env.CORS_ORIGIN && !process.env.CORS_ORIGIN.includes("localhost");

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax"
};

export const ANONYMOUS_USER_NAME = "StreamWire User";