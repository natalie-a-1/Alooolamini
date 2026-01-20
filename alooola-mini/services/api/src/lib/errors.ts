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

export function badRequest(message: string, details?: Record<string, unknown>) {
  return new ApiError(400, "BAD_REQUEST", message, details);
}

export function unauthorized(message = "Unauthorized") {
  return new ApiError(401, "UNAUTHORIZED", message);
}

export function forbidden(message = "Forbidden") {
  return new ApiError(403, "FORBIDDEN", message);
}

export function notFound(message = "Not found") {
  return new ApiError(404, "NOT_FOUND", message);
}

export function conflict(message = "Conflict") {
  return new ApiError(409, "CONFLICT", message);
}
