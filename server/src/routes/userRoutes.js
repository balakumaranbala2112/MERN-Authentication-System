import express from "express";
import protect from "../middleware/protect.js";
import { getUserData } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/data", protect, getUserData);

export default userRouter;
