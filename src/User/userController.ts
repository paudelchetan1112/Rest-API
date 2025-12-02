import type{Request, Response } from "express";
import type { NextFunction } from "express";
import createHttpError from "http-errors";
const createUser=async(req:Request,res:Response,next:NextFunction)=>{
    console.log(req.body)
const {name, email, password}=req.body;


// validation
if(!name || !email || !password){
    const error=createHttpError(400,"All Fields are required");
    return next(error)

}



res.json({message:"user Created"})

}

export {createUser}