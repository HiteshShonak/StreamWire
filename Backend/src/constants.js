export const DB_NAME = "StreamWire";

// cross-origin check (vercel + render = diff domains)
const isProduction = process.env.CORS_ORIGIN && !process.env.CORS_ORIGIN.includes("localhost");

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax"
};

export const ANONYMOUS_USER_NAME = "StreamWire User";