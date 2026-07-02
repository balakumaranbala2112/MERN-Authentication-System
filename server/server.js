import app from "./src/app.js";
import config from "./src/config/env.js";
import { connectDB, disconnectDB } from "./src/config/mongodb.js";

let server = null;

const startServer = async () => {
  try {
    // Start accepting API requests only after MongoDB is connected.
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

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            return reject(error);
          }

          resolve();
        });
      });

      console.log("HTTP server closed");
    }

    await disconnectDB();

    process.exit(0);
  } catch (error) {
    console.error("Graceful shutdown failed:", error.message);
    process.exit(1);
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
