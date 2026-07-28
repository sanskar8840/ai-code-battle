const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const config = require("../config/config");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

/**
 * Protects routes: verifies JWT from the Authorization header (Bearer token)
 * or the httpOnly cookie, attaches the authenticated user to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new ApiError("Not authorized. Please log in.", 401);
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError("The user for this token no longer exists.", 401);
    }
    if (!user.isActive) {
      throw new ApiError("This account has been deactivated.", 403);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError("Not authorized. Invalid or expired token.", 401);
  }
});

/**
 * Restricts a route to specific roles.
 * Usage: router.delete('/:id', protect, authorize('admin'), controller)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(`Role '${req.user?.role}' is not authorized to access this resource`, 403);
    }
    next();
  };
};

/**
 * Optional auth: attaches req.user if a valid token is present,
 * but does not block the request if absent. Useful for endpoints
 * that behave differently for logged-in vs anonymous users.
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id);
    if (user && user.isActive) req.user = user;
  } catch (err) {
    // Silently ignore invalid tokens for optional auth
  }
  next();
});

module.exports = { protect, authorize, optionalAuth };
