import dns from "node:dns";
import mongoose from "mongoose";
import config from "./env.js";

if (config.nodeEnv === "development" && config.customDnsServers.length > 0) {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

export const connectDB = async () => {
  try {
    if (config.nodeEnv === "development") {
      console.log("Node DNS servers:", dns.getServers());
    }

    await mongoose.connect(config.mongo.mongoUri, {
      dbName: config.mongo.mongoDbName,
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

export const disconnectDB = async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
};
