import 'dotenv/config';
import mongoose from "mongoose";
import connectDB from "./db/connection.js";
import { app } from "./app.js";
import { initTrendCron } from "./cron/trendCron.js";
import { initCloudinaryKeepAliveCron } from "./cron/cloudinaryKeepAlive.js";

let server;

connectDB(process.env.MONGODB_URL)
  .then(() => {
    initTrendCron();
    initCloudinaryKeepAliveCron();
    console.log("Cron Jobs Initialized");

    server = app.listen(process.env.PORT || 8000, () => {
      console.log(`Server Started on port ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.error("DB connection error", error);
    process.exit(1);
  });

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 ${signal} received. Starting graceful shutdown...`);

  // 1. Stop accepting new connections
  if (server) {
    server.close(() => {
      console.log("HTTP server closed");
    });
  }

  // 2. Close MongoDB connection
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (err) {
    console.error("Error closing MongoDB connection:", err);
  }

  // 3. Exit process
  console.log("👋 Graceful shutdown complete. Goodbye!");
  process.exit(0);
};

// Listen for termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));