import { Request, Response, NextFunction } from "express";

export function notFoundHandler(
  req: Request,
  res: Response
) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("❌ Server Error:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}