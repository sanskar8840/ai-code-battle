/**
 * Custom error class carrying an HTTP status code.
 * Thrown from controllers/services, caught by the global error middleware.
 */
class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
