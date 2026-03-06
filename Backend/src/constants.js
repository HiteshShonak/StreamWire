export const DB_NAME = "StreamWire";

const isProduction = process.env.CORS_ORIGIN && !process.env.CORS_ORIGIN.includes("localhost");

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProduction,                       // HTTPS required for cross-origin cookies
    sameSite: isProduction ? "None" : "Lax"     // "None" for cross-origin (Vercel → Render), "Lax" for localhost
};

export const ANONYMOUS_USER_NAME = "StreamWire User";