import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

async function connectDB(url) {
  try {
    const connectionInstance = await mongoose.connect(`${url}/${DB_NAME}`);
    console.log("Connected to MongoDB");
    console.log("DB Host:", connectionInstance.connection.host);
    
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
}

export default connectDB;
