import express from "express";
import { loginUser } from "./userController.ts";
import { createUser } from "./userController.ts";
const userRouter = express.Router();
userRouter.post("/register",createUser);
userRouter.post("/login",loginUser)
export default userRouter;
