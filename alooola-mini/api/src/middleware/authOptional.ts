/**
 * Optional Authentication Middleware
 * 
 * Express middleware to optionally authenticate requests using JWT access tokens.
 * 
 * If an Authorization header with a Bearer token is present and valid, attaches `user` object to the request:
 *   - id: The user ID (from token's "sub" claim)
 *   - email: The user's email, if provided by token
 * 
 * If no token is provided or the token is invalid/expired, the middleware silently continues (no user set).
 * 
 * Use this on routes where user context is optional, not required.
 * 
 * @param req - Express request object
 * @param _res - Express response object (unused)
 * @param next - Express next callback
 */
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

/**
 * Optionally authenticates the request via JWT Bearer token.
 * Sets req.user if valid token is present; otherwise, leaves req.user undefined.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authorizationHeader = req.header("Authorization");

  // If no Authorization header or malformed, skip setting user
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return next();
  }

  // Extract the token from the header
  const token = authorizationHeader.slice(7).trim();

  try {
    // Verify token and decode payload
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string; email?: string };

    // Attach user info to request object
    req.user = { id: payload.sub, email: payload.email };
  } catch {
    // Silently ignore invalid or expired tokens
  }

  return next();
}
