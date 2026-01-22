/**
 * Request ID Middleware
 *
 * Ensures each request has a unique identifier.
 * - If the client provides an "X-Request-Id" header, uses that value.
 * - Otherwise, generates a new UUID as the request ID.
 *
 * The request ID is attached to:
 *   - req.id: for downstream middleware/use
 *   - X-Request-Id response header: for client traceability
 *
 * Usage:
 *   app.use(requestId);
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware callback
 */
import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";

/**
 * Express middleware to set and propagate a request ID for every incoming request.
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  // Prefer client-provided X-Request-Id if present and non-empty, else generate a new UUID
  const headerId = req.header("X-Request-Id");
  const id = headerId && headerId.length > 0 ? headerId : randomUUID();

  req.id = id;
  res.setHeader("X-Request-Id", id);

  next();
}
