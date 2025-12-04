import type { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary.ts";
import path from "node:path";
import { fileURLToPath } from "node:url";
import createHttpError from "http-errors";
import bookModel from "./bookModel.ts";
import fs from "node:fs";
import type { AuthRequest } from "../middlewares/authenticate.ts";

// ✅ Proper __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, genre } = req.body;

  try {
    // ✅ Validation: title & genre required
    if (!title || !genre) {
      return next(createHttpError(400, "Title and genre are required"));
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // ✅ Validation: coverImage required
    if (!files || !files.coverImage || files.coverImage.length === 0) {
      return next(createHttpError(400, "Cover image is required"));
    }

    // ✅ Cover image file
    const coverFile = files.coverImage[0];
    const coverImageMimeType = coverFile.mimetype?.split("/")?.at(-1) || "jpg";
    const fileName = coverFile.filename;
    const filePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      fileName
    );

    // ✅ Upload cover image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: fileName,
      folder: "book-covers",
      resource_type: "image", // explicitly set for images
      format: coverImageMimeType, // ✅ include format
    });

    // ✅ Upload book file if exists
    let bookFileUploadResult: any = null;
    let bookFilePath: string | null = null;

    if (files.file && files.file.length > 0) {
      const bookFileName = files.file[0].filename;
      const bookFileMimeType = files.file[0]?.mimetype.split("/")?.at(-1) || "pdf";
      bookFilePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        bookFileName
      );

      bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath, {
        resource_type: "raw", // for non-image files
        filename_override: bookFileName,
        folder: "book-pdfs",
        format: bookFileMimeType, // ✅ include format
      });
    }

    // ✅ Author validation from token
    const _req = req as AuthRequest;
    if (!_req.userId) {
      return next(createHttpError(401, "User not authenticated"));
    }

    // ✅ Save book in DB
    const newBook = await bookModel.create({
      title,
      genre,
      author: _req.userId,
      coverImage: uploadResult.secure_url,
      file: bookFileUploadResult?.secure_url,
    });

    // ✅ Delete temp files (non-blocking)
    try {
      await fs.promises.unlink(filePath);
      if (bookFilePath) {
        await fs.promises.unlink(bookFilePath);
      }
    } catch (error) {
      console.error("Temp file cleanup failed:", error);
    }

    // ✅ Single response
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

export const updateBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, genre } = req.body;
  const bookId = req.params.bookId;

  const book = await bookModel.findOne({ _id: bookId });

  if (!book) {
    return next(createHttpError(404, "Book not found"));
  }

  // ✅ Check access
  const _req = req as AuthRequest;
  if (book.author.toString() !== _req.userId) {
    return next(createHttpError(403, "You cannot update others' book."));
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  let completeCoverImage = "";
  let completeFileUrl = "";

  // ✅ Handle file upload if exists
  if (files?.file?.length > 0) {
    const bookFileName = files.file[0].filename;
    const bookFileMimeType = files.file[0]?.mimetype.split("/")?.at(-1) || "pdf";
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads/" + bookFileName
    );

    const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: "raw",
      filename_override: bookFileName,
      folder: "book-pdfs",
      format: bookFileMimeType, // ✅ include format
    });

    completeFileUrl = uploadResultPdf.secure_url;
    await fs.promises.unlink(bookFilePath);
  }

  // ✅ Handle cover image upload if exists
  if (files?.coverImage?.length > 0) {
    const filename = files.coverImage[0].filename;
    const coverMimeType = files.coverImage[0]?.mimetype.split("/")?.at(-1) || "jpg";
    const filePath = path.resolve(
      __dirname,
      "../../public/data/uploads/" + filename
    );

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: filename,
      folder: "book-covers",
      format: coverMimeType, // ✅ include format
    });

    completeCoverImage = uploadResult.secure_url;
    await fs.promises.unlink(filePath);
  }

  // ✅ Update book in DB
  const updatedBook = await bookModel.findOneAndUpdate(
    { _id: bookId },
    {
      title,
      genre,
      coverImage: completeCoverImage || book.coverImage,
      file: completeFileUrl || book.file,
    },
    { new: true }
  );

  return res.json(updatedBook);
};
//todo: add pagination. 
export const listBook=async (req:Request, res:Response,next:NextFunction)=>{
  try{
const book =await bookModel.find();
res.json(book)
  }
  catch(error){
    return next(createHttpError(500, "Error while getting a book "))
  }
  
}

export const getSingleBook=async(req:Request, res:Response, next:NextFunction)=>{
  const bookId=req.params.bookId;
  try{
const book=await bookModel.findOne({_id:bookId});
if(!book){
  return next(createHttpError(404, "Book not Found."))
}
res.json(book )
  }
  catch(err){
return next(createHttpError(500, "Book "))
  }
}