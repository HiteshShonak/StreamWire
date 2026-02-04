export const DB_NAME = "StreamWire";

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax"
};

export const ANONYMOUS_USER_NAME = "StreamWire User";