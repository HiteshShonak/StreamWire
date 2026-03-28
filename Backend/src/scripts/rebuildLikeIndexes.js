import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../db/connection.js";
import { Like } from "../models/like.model.js";

const formatIndexes = (indexes) =>
  indexes.map((idx) => ({
    name: idx.name,
    key: idx.key,
    unique: Boolean(idx.unique),
    sparse: Boolean(idx.sparse),
    partialFilterExpression: idx.partialFilterExpression || null,
  }));

const rebuildLikeIndexes = async () => {
  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL is required");
  }

  await connectDB(process.env.MONGODB_URL);

  const collection = Like.collection;
  const before = await collection.indexes();

  console.log("Like indexes before sync:");
  console.log(JSON.stringify(formatIndexes(before), null, 2));

  const droppedIndexes = await Like.syncIndexes();

  console.log("Dropped indexes:", JSON.stringify(droppedIndexes));

  const after = await collection.indexes();

  console.log("Like indexes after sync:");
  console.log(JSON.stringify(formatIndexes(after), null, 2));

  await mongoose.disconnect();
  console.log("Like index rebuild complete.");
};

rebuildLikeIndexes().catch(async (error) => {
  console.error("Failed to rebuild like indexes:", error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
