/**
 * @file requestMeta.ts
 * @description Helpers for extracting and standardizing request metadata (IP address, user agent) for logging, analytics, and token issuance.
 */

import { Request } from "express";

/**
 * Standardized shape for HTTP request metadata of interest.
 *
 * @property {string} [userAgent]  The user agent string from the incoming request headers (if present).
 * @property {string} [ipAddress]  The resolved IP address of the client making the request.
 */
export type RequestMeta = {
  /** Browser or client user agent */
  userAgent?: string;
  /** Remote client's IP address */
  ipAddress?: string;
};

/**
 * Extracts normalized request metadata from an Express Request object.
 *
 * @param {Request} req - Express HTTP request object.
 * @returns {RequestMeta}  Metadata containing user agent and client IP.
 */
export function getRequestMeta(req: Request): RequestMeta {
  return {
    userAgent: req.get("user-agent") ?? undefined,
    ipAddress: req.ip ?? undefined,
  };
}
