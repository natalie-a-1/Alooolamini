/**
 * Project source file.
 */
export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(status: number, code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** Helper for bad request. */
export function badRequest(message: string, code?: string, details?: Record<string, unknown>) {
  return new ApiError(400, code ?? "BAD_REQUEST", message, details);
}

/** Helper for unauthorized. */
export function unauthorized(message = "Unauthorized") {
  return new ApiError(401, "UNAUTHORIZED", message);
}

/** Helper for forbidden. */
export function forbidden(message = "Forbidden") {
  return new ApiError(403, "FORBIDDEN", message);
}

/** Helper for not found. */
export function notFound(message = "Not found") {
  return new ApiError(404, "NOT_FOUND", message);
}

/** Helper for conflict. */
export function conflict(message = "Conflict") {
  return new ApiError(409, "CONFLICT", message);
}
