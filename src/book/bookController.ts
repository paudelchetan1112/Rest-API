import type { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary.ts";
import path from "node:path";
import { fileURLToPath } from "node:url";
import createHttpError from "http-errors";
import bookModel from "./bookModel.ts";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;

  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    //  check if coverImage exists
    if (!files.coverImage || files.coverImage.length === 0) {
      return res.status(400).json({ message: "Cover image is required" });
    }

    const coverFile = files.coverImage[0];
    const converImageMimeType = coverFile.mimetype.split("/").at(-1);
    const fileName = coverFile.filename;

    const filePath = path.resolve(__dirname, "../../public/data/uploads", fileName);

    // ✅ upload cover image
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: fileName,
      folder: "book-covers",
      format: converImageMimeType,
    });

    //  upload book file if exists
    let bookFileUploadResult = null;
    let bookFilePath: string | null = null;

    if (files.file && files.file.length > 0) {
      const bookFileName = files.file[0].filename;
      bookFilePath = path.resolve(__dirname, "../../public/data/uploads", bookFileName);

      bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath, {
        resource_type: "raw",
        filename_override: bookFileName,
        folder: "book-pdfs",
        format: "pdf",
      });
    }

    //  save book in DB
    const newBook = await bookModel.create({
      title,
      genre,
      author: "692ffed52362c77ebf788b33", // replace with dynamic author later
      coverImage: uploadResult.secure_url,
      file: bookFileUploadResult?.secure_url,
    });

    // delete temp files
    try {
      await fs.promises.unlink(filePath);
      if (bookFilePath) {
        await fs.promises.unlink(bookFilePath);
      }
    } catch (error) {
      console.error(error);
      return next(createHttpError(500, "Error while deleting temporary file"));
    }

    //  single response
    return res.status(201).json({
      id: newBook._id,
      message: "Book created successfully",
      coverUrl: uploadResult.secure_url,
      bookFileUrl: bookFileUploadResult?.secure_url,
    });
  } catch (error) {
    console.error(error);
    return next(createHttpError(500, "Error while uploading file"));
  }
};