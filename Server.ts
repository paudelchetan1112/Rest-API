// import express from "express"
import app from "./src/app.ts";
import { config } from "./src/config/config.ts";
import connectDB from "./src/config/db.ts";



const startServer =async () => {
    //connect dbbase
await connectDB();
  const PORT = config.port || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
};
startServer();
