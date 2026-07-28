const express = require("express");
const { body } = require("express-validator");
const {
  signup,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const { authLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

router.post(
  "/signup",
  authLimiter,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("username")
      .trim()
      .toLowerCase()
      .matches(/^[a-z0-9_]{3,30}$/)
      .withMessage("Username must be 3-30 chars: lowercase letters, numbers, underscores only"),
    body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  validate,
  signup
);

router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

router.post(
  "/forgot-password",
  authLimiter,
  [body("email").isEmail().withMessage("A valid email is required").normalizeEmail()],
  validate,
  forgotPassword
);

router.put(
  "/reset-password/:resetToken",
  [body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")],
  validate,
  resetPassword
);

router.put(
  "/update-password",
  protect,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters"),
  ],
  validate,
  updatePassword
);

module.exports = router;
