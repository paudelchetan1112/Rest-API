import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel.ts";
import bcrypt from "bcrypt";
import { config } from "../config/config.ts";
import pkg from "jsonwebtoken"
const {sign}=pkg;

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    // validation
    if (!name || !email || !password) {
      return next(createHttpError(400, "All fields are required"));
    }

    // check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return next(createHttpError(400, "User already exists with this email."));
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user
    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    // generate JWT
    if (!config.jwtSecret) {
      return next(createHttpError(500, "JWT secret is not configured"));
    }

    const token = sign({ sub: newUser._id }, config.jwtSecret, { expiresIn: "7d" });

    // response
    res.status(201).json({
      accessToken: token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    next(error);
  }
};