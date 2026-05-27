import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { HttpError } from "../errors/HttpError";
import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: err.errors[0]?.message || "Malformed data",
      errors: err.errors,
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      message: err.message,
    });
    return;
  }

  console.error(err); // Log stack trace in dev
  res.status(500).json({
    message: "Internal Server Error",
  });
};
