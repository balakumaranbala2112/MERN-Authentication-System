import app from "./src/app.js";
import "dotenv/config";
import { connectDB, disconnect } from "./src/config/mongodb.js";
import config from "./src/config/env.js";

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(config.port, () => {
      console.log(`Server is listening on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  console.log(`${signal} received. Closing server...`);

  if (server) {
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Promise Rejection:", error);
  gracefulShutdown("unhandledRejection");
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

startServer();
