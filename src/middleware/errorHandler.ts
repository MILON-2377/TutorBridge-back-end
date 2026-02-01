import { Request, Response, NextFunction } from "express";
import { success, ZodError } from "zod";
import ApiError from "../utils/ApiError.js";
import { BetterAuthError } from "better-auth";

export default class ErrorHandler {
  public static errorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: err.flatten().fieldErrors,
      });
    }


    if(err instanceof BetterAuthError){
      return res.status(400).json({
        success: false,
        message: "Better auth errors",
        errors: `${err.cause}; stack: ${err.stack}`
      })
    }

    // Custom Api errors
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        errors: err.message,
      });
    }

    // Prisma error
    if (typeof err === "object" && err !== null && "code" in err) {
      return res.status(400).json({
        success: false,
        message: "Database error",
        error: err,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  };
}
