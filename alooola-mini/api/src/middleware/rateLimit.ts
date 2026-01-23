/**
 * Rate Limiting Middleware
 *
 * Provides a configurable Express middleware for rate limiting incoming requests.
 * Uses the "express-rate-limit" package.
 *
 * To enable rate limiting, set env.RATE_LIMIT_ENABLED to true.
 * If disabled, the middleware is a no-op (passes all requests).
 *
 * @param windowMs - Time window in milliseconds for rate limiting (e.g., 60000 for 1 minute)
 * @param max - Maximum number of requests allowed per window per IP
 * @returns Express middleware function
 */

import rateLimit from "express-rate-limit";
import { env } from "../config/env";

/**
 * Creates and returns an Express rate limiting middleware.
 *
 * When enabled, enforces a maximum number of requests per IP per time window.
 * When disabled via environment configuration, acts as a pass-through middleware.
 *
 * @example
 *   app.use(createRateLimiter(60000, 100)); // 100 requests per minute per IP
 */
export function createRateLimiter(windowMs: number, max: number) {
  // If rate limiting is disabled by environment, return a middleware that does nothing
  if (!env.RATE_LIMIT_ENABLED) {
    return (_req: unknown, _res: unknown, next: () => void) => next();
  }

  // Otherwise, use express-rate-limit to enforce request rate limits
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true, // Return rate limit info in rate limit standard headers
    legacyHeaders: false,  // Disable deprecated X-RateLimit-* headers
  });
}
