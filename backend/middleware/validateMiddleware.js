const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

/**
 * Runs after an express-validator chain (e.g. body('email').isEmail()).
 * Collects all validation failures into one readable ApiError.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const message = errors
    .array()
    .map((e) => e.msg)
    .join(", ");

  throw new ApiError(message, 400);
};

module.exports = validate;
