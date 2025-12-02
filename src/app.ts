import express from 'express'

const app = express()

//Routes
//http methods: Get, Post, put, patch, delete
app.get('/',(req,res)=>{
    res.send("welcome to the server")
})
export default app