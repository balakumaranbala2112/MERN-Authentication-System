import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/mongodb.js";

/* Routes */

import authRoutes from "./src/routes/authRoutes.js"

const app = express();
const PORT = process.env.PORT || 4000;
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));

/* API Endpoints */
app.use("/api/v1/auth", authRoutes);

app.use("/", (req, res) => {
  res.status(200).json("Hello MERN Auth API is working");
});

app.listen(PORT, () => {
  console.log(`server is listening on http://localhost:${PORT}`);
});
