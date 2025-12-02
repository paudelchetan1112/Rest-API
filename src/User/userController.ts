import type{Request, Response } from "express";
import type { NextFunction } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel.ts";

const createUser=async(req:Request,res:Response,next:NextFunction)=>{
    console.log(req.body)
const {name, email, password}=req.body;


// validation
if(!name || !email || !password){
    const error=createHttpError(400,"All Fields are required");
    return next(error)

}

//Database call 
const user=await userModel.findOne({email});

res.json({message:"user Created"})


if(user){
    const error=createHttpError(400,"User already exit with this email.")
    return next(error)
}
}
export {createUser}