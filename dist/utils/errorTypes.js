"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Custom error class for API errors
 */
class ApiError extends Error {
    constructor(message, statusCode, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
/**
 * Custom error for Bad Request (400)
 */
class BadRequestError extends ApiError {
    constructor(message, meta = {}) {
        super(message, 400);
        this.meta = meta;
        // this.isOperational = true;
        // ✅ Fix logging issue
        console.warn("Validation Error:", JSON.stringify({ message, meta }, null, 2));
    }
}
/**
 * Custom error for Unauthorized (401)
 */
class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized access') {
        super(message, 401);
    }
}
/**
 * Custom error for Forbidden (403)
 */
class ForbiddenError extends ApiError {
    constructor(message = 'Forbidden access') {
        super(message, 403);
    }
}
/**
 * Custom error for Not Found (404)
 */
class NotFoundError extends ApiError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
/**
 * Custom error for Conflict (409)
 */
class ConflictError extends ApiError {
    constructor(message) {
        super(message, 409);
    }
}
/**
 * Custom error for Internal Server Error (500)
 */
class InternalServerError extends ApiError {
    constructor(message = 'Internal server error') {
        super(message, 500, false);
    }
}
exports.default = {
    ApiError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    InternalServerError
};
