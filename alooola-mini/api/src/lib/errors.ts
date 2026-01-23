/**
 * @file errors.ts
 * @description Defines standardized API error classes and helper functions for error handling in the application.
 */

/**
 * Represents a standardized API error to be thrown or passed to Express error handlers.
 * Extends the built-in Error with HTTP status code, error code, and optional details.
 *
 * @class ApiError
 * @extends Error
 */
export class ApiError extends Error {
  /** HTTP status code to be sent in the response. */
  public status: number;

  /** Application-level error code for programmatic handling. */
  public code: string;

  /**
   * Additional contextual details about the error, such as validation issues.
   * Optional.
   */
  public details?: Record<string, unknown>;

  /**
   * Constructs a new ApiError instance.
   *
   * @param {number} status - HTTP status code (e.g., 400, 401, 404).
   * @param {string} code - Application-specific error code.
   * @param {string} message - Human-readable message describing the error.
   * @param {Record<string, unknown>} [details] - Optional additional details to include.
   */
  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.status = status;
    this.code = code;
    if (details) this.details = details;

    // Maintains proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Returns an ApiError representing a "400 Bad Request" error.
 *
 * @param {string} message - Error message.
 * @param {string} [code="BAD_REQUEST"] - Optional error code override.
 * @param {Record<string, unknown>} [details] - Optional extra details.
 * @returns {ApiError}
 */
export function badRequest(
  message: string,
  code: string = "BAD_REQUEST",
  details?: Record<string, unknown>
): ApiError {
  return new ApiError(400, code, message, details);
}

/**
 * Returns an ApiError representing a "401 Unauthorized" error.
 *
 * @param {string} [message="Unauthorized"] - Error message.
 * @returns {ApiError}
 */
export function unauthorized(message: string = "Unauthorized"): ApiError {
  return new ApiError(401, "UNAUTHORIZED", message);
}

/**
 * Returns an ApiError representing a "403 Forbidden" error.
 *
 * @param {string} [message="Forbidden"] - Error message.
 * @returns {ApiError}
 */
export function forbidden(message: string = "Forbidden"): ApiError {
  return new ApiError(403, "FORBIDDEN", message);
}

/**
 * Returns an ApiError representing a "404 Not Found" error.
 *
 * @param {string} [message="Not found"] - Error message.
 * @returns {ApiError}
 */
export function notFound(message: string = "Not found"): ApiError {
  return new ApiError(404, "NOT_FOUND", message);
}

/**
 * Returns an ApiError representing a "409 Conflict" error.
 *
 * @param {string} [message="Conflict"] - Error message.
 * @returns {ApiError}
 */
export function conflict(message: string = "Conflict"): ApiError {
  return new ApiError(409, "CONFLICT", message);
}
