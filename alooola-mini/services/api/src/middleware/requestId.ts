import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";

export function requestId(req: Request, res: Response, next: NextFunction) {
  const headerId = req.header("X-Request-Id");
  const id = headerId && headerId.length > 0 ? headerId : randomUUID();
  req.id = id;
  res.setHeader("X-Request-Id", id);
  next();
}
