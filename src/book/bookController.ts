import type { NextFunction, Request, Response } from "express";

export const createBook=async (req:Request,res:Response, next:NextFunction)=>{
res.json({message:"welcome to the create book "})

}