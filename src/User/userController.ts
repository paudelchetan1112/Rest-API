import type{Request, Response } from "express";
import type { NextFunction } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel.ts";
import bcrypt from 'bcrypt'

const createUser=async(req:Request,res:Response,next:NextFunction)=>{
    console.log(req.body)
const {name, email, password}=req.body;


// validation
if(!name || !email || !password){
    const error=createHttpError(400,"All Fields are required");
    return next(error)

}

//Database call avoid to insert that email which is already exit
const user=await userModel.findOne({email});

res.json({message:"user Created"})


if(user){
    const error=createHttpError(400,"User already exit with this email.")
    return next(error)
}
//password->hash
const hashedPassword=await bcrypt.hash(password,10)
}

export {createUser}