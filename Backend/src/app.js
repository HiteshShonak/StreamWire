import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import { authenticate } from "./middlewares/auth.middleware.js";

const app = express();

// 🛡️ Security Headers (helmet)
app.use(helmet());

// 📝 HTTP Request Logging (morgan)
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// 🔐 Global Auth Middleware
app.use(authenticate);

// --- 🚦 IMPORT ROUTES ---
import userRoutes from './routes/user.routes.js';
import videoRoutes from './routes/video.routes.js';
import tweetRoutes from './routes/tweet.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import playlistRoutes from './routes/playlist.routes.js';
import commentRoutes from './routes/comment.routes.js';
import likeRoutes from './routes/like.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import libraryRoutes from './routes/library.routes.js';
import contactRoutes from './routes/contact.routes.js';

// --- 🔗 MOUNT ROUTES ---
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/tweets', tweetRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/playlists', playlistRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/likes', likeRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/library', libraryRoutes);
app.use('/api/v1/contact', contactRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (statusCode >= 500) {
        console.error(`🔥 [SERVER ERROR]: ${err.stack}`);
    } else {
        console.log(`ℹ️  [${statusCode}] ${message}`);
    }

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || []
    });
});

export { app };