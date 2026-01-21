/**
 * Helpers for extracting common request metadata used in logging and token issuance.
 */
import { Request } from "express";

export type RequestMeta = { userAgent?: string; ipAddress?: string };

/**
 * Extracts normalized request metadata.
 */
export function getRequestMeta(req: Request): RequestMeta {
  return {
    userAgent: req.get("user-agent") ?? undefined,
    ipAddress: req.ip,
  };
}
