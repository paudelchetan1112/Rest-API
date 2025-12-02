import type { Request, Response } from "express";
import { config } from "../config/config.ts";
import { HttpError } from "http-errors";
import type { NextFunction } from "express";
const globalErrorHandler=(err:HttpError,req:Request,res:Response,next:NextFunction)=>{
    const statusCode=err.statusCode||5000;
    return res.status(statusCode).json({
        message:err.message,
        errorStack:config.env==='development'?err.stack:"",
    
    })}

    export default globalErrorHandler