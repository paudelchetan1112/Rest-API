import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { createBook } from "./bookController.ts";

// ✅ Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bookRouter = express.Router();

// ✅ Ensure upload path exists
import fs from "node:fs";
const uploadPath = path.resolve(__dirname, "../../public/data/uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ✅ Multer setup
const upload = multer({
  dest: uploadPath,
  limits: { fileSize: 10 * 1024 * 1024 }, // 30 MB
});

// ✅ Route
bookRouter.post(
  "/register",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  createBook
);

export default bookRouter;