import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel.ts";
import bcrypt from "bcrypt";
import { config } from "../config/config.ts";
import pkg from "jsonwebtoken";
import type { User } from "./userTypes.ts";


const { sign } = pkg;

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  let name: string, email: string, password: string;

  // Step 1: Validation
  try {
    ({ name, email, password } = req.body);

    if (!name || !email || !password) {
      return next(createHttpError(400, "All fields are required"));
    }
  } catch (error) {
    return next(createHttpError(400, "Error while reading user data"));
  }

  // Step 2: Check existing user
  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return next(createHttpError(400, "User already exists with this email"));
    }
  } catch (error) {
    return next(createHttpError(500, "Error while checking existing user"));
  }

  // Step 3: Hash password
  let hashedPassword: string;
  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch (error) {
    return next(createHttpError(500, "Error while hashing password"));
  }

  // Step 4: Create user
  let newUser: User;
  try {
    if (!config.jwtSecret) {
      return next(createHttpError(500, "JWT secret is not configured"));
    }

    newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while creating user"));
  }

  // Step 5: Generate JWT
  try {
    const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
      expiresIn: "7d",
      algorithm: "HS256",
    });

    return res.status(201).json({
      accessToken: token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    return next(createHttpError(500, "Error while signing JWT"));
  }
};

export const loginUser= async (req:Request, res:Response, next:NextFunction)=>{
  const{email, password}=req.body;
  if(!email||!password){
    return next(createHttpError(400, "All fields are required"));
  }
//todo wrap in try catch 
  const user=await userModel.findOne({email});

  if(!user){
    return next(createHttpError(404, "user not found"))
  }
  const isMatch=await bcrypt.compare(password, user.password);
  if(!isMatch){
    return next(createHttpError(400, "Username or password Incorrect"))
  }

  //create accesstoken 
  //todo handle trycatch
  try {
    const token = sign({ sub: user._id }, config.jwtSecret as string, {
      expiresIn: "7d",
      algorithm: "HS256",
    });

    return res.status(201).json({
      accessToken: token
    });
  } catch (error) {
    return next(createHttpError(500, "Error while signing JWT"));
  }
}