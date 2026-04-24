import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export class HttpError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res
      .status(400)
      .json({ error: "Validation failed", issues: err.issues });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, details: err.details });
    return;
  }
  if (err instanceof Error) {
    // Handle Mongo duplicate key
    if ((err as any).code === 11000) {
      res.status(409).json({
        error: "Duplicate key",
        details: (err as any).keyValue,
      });
      return;
    }
    // eslint-disable-next-line no-console
    console.error("[error]", err);
    res.status(500).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: "Unknown error" });
}
