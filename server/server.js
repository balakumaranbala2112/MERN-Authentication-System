import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/mongodb.js";

/* Routes */

import authRoutes from "./src/routes/authRoutes.js"
import userRouter from "./src/routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 4000;
connectDB();

const allowedOrigins = ["http://localhost:5173"];

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

/* API Endpoints */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRouter);

app.get("/", (req, res) => {
  res.status(200).json("Hello MERN Auth API is working");
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "API Route Not Found" });
});

app.listen(PORT, () => {
  console.log(`server is listening on http://localhost:${PORT}`);
});
