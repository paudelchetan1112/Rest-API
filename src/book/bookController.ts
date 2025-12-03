import type { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary.ts";
import path from "node:path";
import { fileURLToPath } from "node:url";
import createHttpError from "http-errors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("body", req.body);
    console.log("files", req.files);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // ✅ check if coverImage exists
    if (!files.coverImage || files.coverImage.length === 0) {
      return res.status(400).json({ message: "Cover image is required" });
    }

    const coverFile = files.coverImage[0];
    const converImageMimeType = coverFile.mimetype.split("/").at(-1); // e.g. "jpeg"
    const fileName = coverFile.filename;

    // multer stores file in uploads folder
    const filePath = path.resolve(__dirname, "../../public/data/uploads", fileName);

    // ✅ upload cover image to cloudinary
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: fileName,
      folder: "book-covers",
      format: converImageMimeType,
    });

    // ✅ check if book file exists
    let bookFileUploadResult = null;
    if (files.file && files.file.length > 0) {
      const bookFileName = files.file[0].filename;
      const bookFilePath = path.resolve(__dirname, "../../public/data/uploads", bookFileName);

      bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath, {
        resource_type: "raw", // for non-image files
        filename_override: bookFileName,
        folder: "book-pdfs",
        format: "pdf",
      });

      console.log("bookFileUploadResult", bookFileUploadResult);
    }

    console.log("uploadResult", uploadResult);

    return res.json({
      message: "Book created successfully",
      coverUrl: uploadResult.secure_url,
      bookFileUrl: bookFileUploadResult?.secure_url,
    });
  } catch (error) {
  return next(createHttpError(500, "Error while uploading file"))
  }
};