/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  isOperational: boolean;
  statusCode: any;
  constructor(message: any, statusCode: any, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Custom error for Bad Request (400)
 */
class BadRequestError extends ApiError {
  meta: any;

  constructor(message: any, meta: any = {}) {
    super(message, 400);
    this.meta = meta; 
    // this.isOperational = true;

    // ✅ Fix logging issue
    console.warn("Validation Error:", JSON.stringify({message, meta}, null, 2));
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
  constructor(message: any) {
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

export default {
  ApiError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError
};