const ApiError = require("../utils/ApiError");

/**
 * Catches unmatched routes and forwards a 404 into the error handler.
 */
const notFound = (req, res, next) => {
  next(new ApiError(`Route not found - ${req.originalUrl}`, 404));
};

/**
 * Centralized error handler. Normalizes Mongoose/JWT/validation errors
 * into a consistent { success, message } JSON shape.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  console.error(err.stack);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    error = new ApiError(`Resource not found with id: ${err.value}`, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    error = new ApiError(`Duplicate value for ${field}. Please use another value.`, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = new ApiError(message, 400);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new ApiError("Invalid token. Please log in again.", 401);
  }
  if (err.name === "TokenExpiredError") {
    error = new ApiError("Session expired. Please log in again.", 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
