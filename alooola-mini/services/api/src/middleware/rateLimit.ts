/**
 * Project source file.
 */
import rateLimit from "express-rate-limit";
import { env } from "../config/env";

/** Create rate limiter. */
export function createRateLimiter(windowMs: number, max: number) {
  if (!env.RATE_LIMIT_ENABLED) {
    return (_req: unknown, _res: unknown, next: () => void) => next();
  }

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
  });
}
