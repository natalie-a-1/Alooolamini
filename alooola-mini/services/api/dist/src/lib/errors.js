"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
exports.badRequest = badRequest;
exports.unauthorized = unauthorized;
exports.forbidden = forbidden;
exports.notFound = notFound;
exports.conflict = conflict;
class ApiError extends Error {
    status;
    code;
    details;
    constructor(status, code, message, details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }
}
exports.ApiError = ApiError;
function badRequest(message, details) {
    return new ApiError(400, "BAD_REQUEST", message, details);
}
function unauthorized(message = "Unauthorized") {
    return new ApiError(401, "UNAUTHORIZED", message);
}
function forbidden(message = "Forbidden") {
    return new ApiError(403, "FORBIDDEN", message);
}
function notFound(message = "Not found") {
    return new ApiError(404, "NOT_FOUND", message);
}
function conflict(message = "Conflict") {
    return new ApiError(409, "CONFLICT", message);
}
