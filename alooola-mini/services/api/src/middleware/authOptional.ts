/**
 * Project source file.
 */
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

/** Helper for optional auth. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return next();
  }

  const token = header.replace("Bearer ", "").trim();
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string; email?: string };
    req.user = { id: payload.sub, email: payload.email };
  } catch {
    // ignore invalid token
  }

  return next();
}
