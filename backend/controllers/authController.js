const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const sendResponse = require("../utils/ApiResponse");
const sendTokenResponse = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const config = require("../config/config");

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    const field = existing.email === email ? "Email" : "Username";
    throw new ApiError(`${field} is already in use`, 400);
  }

  const user = await User.create({ name, username, email, password });

  sendTokenResponse(user, 201, res);
});

// @desc    Login with email + password
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new ApiError("This account has been deactivated. Contact support.", 403);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new ApiError("Invalid email or password", 401);
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// @desc    Logout current user (clears auth cookie)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  sendResponse(res, 200, "Logged out successfully");
});

// @desc    Get currently logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  sendResponse(res, 200, "Current user fetched", { user: user.toSafeObject() });
});

// @desc    Send password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Respond identically whether or not the user exists, to avoid leaking
  // which emails are registered.
  const genericMessage = "If that email is registered, a password reset link has been sent.";

  if (!user) {
    return sendResponse(res, 200, genericMessage);
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${config.clientUrl}/reset-password/${resetToken}`;
  const html = `
    <p>Hello ${user.name},</p>
    <p>You requested a password reset for your AI Code Battle Ground Arena account.</p>
    <p><a href="${resetUrl}" target="_blank" rel="noopener noreferrer">Click here to reset your password</a></p>
    <p>This link expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset - AI Code Battle Ground Arena",
      html,
      text: `Reset your password here: ${resetUrl} (expires in 10 minutes)`,
    });
    sendResponse(res, 200, genericMessage);
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError("Email could not be sent. Please try again later.", 500);
  }
});

// @desc    Reset password using the token emailed to the user
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpire");

  if (!user) {
    throw new ApiError("Invalid or expired reset token", 400);
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Change password while logged in
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new ApiError("Current password is incorrect", 401);
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

module.exports = {
  signup,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
};
