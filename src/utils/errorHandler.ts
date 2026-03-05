import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ToolResult } from "../types/toolTypes";
import { logger } from "./logger";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorResponse(error: unknown): ToolResult {
  if (error instanceof Error) {
    return { status: "error", error: error.message };
  }
  return { status: "error", error: String(error) };
}

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error("Unhandled error", { error: err.message, stack: err.stack });

  if (err instanceof ZodError) {
    res.status(400).json({
      status: "error",
      error: "Validation failed",
      details: err.errors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      error: err.message,
    });
    return;
  }

  res.status(500).json({
    status: "error",
    error: "Internal server error",
  });
}
