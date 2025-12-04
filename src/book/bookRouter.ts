import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import fs from "node:fs";
import { createBook } from "./bookController.ts";
import authenticate from "../middlewares/authenticate.ts"; // ✅ add authentication
import { updateBook } from "./bookController.ts";
import { listBook } from "./bookController.ts";
import { getSingleBook } from "./bookController.ts";
import { deleteBook } from "./bookController.ts";

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bookRouter = express.Router();

// ✅ Ensure upload path exists
const uploadPath = path.resolve(__dirname, "../../public/data/uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ✅ Multer setup
const upload = multer({
  dest: uploadPath,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB
});

// ✅ Route with authentication
bookRouter.post(
  "/register",
  authenticate, // ensure only logged-in users can create books
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  createBook
);
bookRouter.patch('/:bookId',authenticate, upload.fields([{name:"coverImage",maxCount:1},{name:"file", maxCount:1}]),updateBook)
bookRouter.get('/',listBook)
bookRouter.get('/:bookId',getSingleBook)
bookRouter.delete('/:bookId',authenticate, deleteBook)

export default bookRouter;