/**
 * Authentication Middleware
 * 
 * Express middleware to authenticate requests using JWT access tokens.
 * The access token must be provided in the Authorization HTTP header as:
 *   Authorization: Bearer <token>
 * 
 * On successful verification, attaches `user` object to the request, containing:
 *   - id: The subject ("sub") from token payload
 *   - email: The user's email (if provided by token)
 * 
 * If the token is missing, invalid, or expired, responds with a 401 Unauthorized error.
 */

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { unauthorized } from "../lib/errors";

/**
 * AccessTokenPayload defines the expected structure of the JWT token payload.
 */
type AccessTokenPayload = {
  sub: string;     // Subject (user id)
  email?: string;  // Optional user email
};

/**
 * requireAuth middleware ensures the request carries a valid access token.
 *
 * @param req - Express request object
 * @param _res - Express response object (unused)
 * @param next - Express next callback
 *
 * @remarks
 * If verification succeeds, attaches user info to req.user and calls next().
 * Otherwise, forwards an "unauthorized" error to error handler.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authorizationHeader = req.header("Authorization");

  // Require Authorization header in the format: "Bearer <token>"
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return next(unauthorized("Missing or malformed Authorization header"));
  }

  // Extract the token part
  const token = authorizationHeader.slice(7).trim();

  try {
    // Verify token validity and decode payload
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;

    // Attach user info to request object for downstream handlers
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (err) {
    // Token verification failed (expired, invalid, etc.)
    return next(unauthorized("Invalid or expired access token"));
  }
}
