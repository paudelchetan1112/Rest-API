
// import express from "express"
import app from "./src/app.ts";
// const app=express();
const PORT=3000;
app.listen(PORT, ()=>{
    console.log(`Server is running at http://localhost:${PORT}`)
})
