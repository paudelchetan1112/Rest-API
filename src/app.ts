import express from 'express'
import createHttpError from 'http-errors'
import globalErrorHandler from './middlewares/globalErrorHandler.ts'
import userRouter from './User/userRouter.ts'

import type { Response,Request, NextFunction } from 'express'
import bookRouter from './book/bookRouter.ts'



const app=express();
app.use(express.json())


//Routes
//http methods: Get, Post, put, patch, delete
app.get("/", (req:Request, res:Response,next:NextFunction)=>{
 const error=createHttpError(400,"something went wrong")
 throw error;
 next()

    // res.json({"message":"welcome to the ebook api"})
})
app.use('/api/users',userRouter)
app.use('/api/books/',bookRouter)

app.use(globalErrorHandler)


export default app