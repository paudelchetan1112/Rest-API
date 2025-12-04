import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { config } from "../config/config.ts";
import jwt from "jsonwebtoken";
const{verify} =jwt;

export interface AuthRequest extends Request {
  userId?: string; // optional for safety
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return next(createHttpError(401, "Authorization token is required"));
    }

    // Expect format: "Bearer <token>"
    const parsedToken = authHeader.split(" ")[1];
    if (!parsedToken) {
      return next(createHttpError(401, "Invalid Authorization header format"));
    }

    try {
      const decoded = verify(parsedToken, config.jwtSecret as string) as { sub: string };

      console.log("decoded", decoded);

      // Attach userId to request for downstream use
      const _req = req as AuthRequest;
      _req.userId = decoded.sub;
    } catch (error) {
      console.error(error);
      return next(createHttpError(401, "Invalid or expired token"));
    }

    next();
  } catch (error) {
    console.error(error);
    return next(createHttpError(401, "Invalid or expired token"));
  }
};

export default authenticate;