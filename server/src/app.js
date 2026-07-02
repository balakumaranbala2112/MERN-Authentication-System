import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import config from "./config/env.js";

/* Routes */

import authRoutes from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin(requestOrigin, callback) {
      if (!requestOrigin || config.clientOrigins.includes(requestOrigin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "10kb" }));

/* API Endpoints */

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Health is Good" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRouter);

app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      config.nodeEnv === "production" && statusCode === 500
        ? "Internal Server Error"
        : err.message,
  });
});

export default app;
