const rateLimit = require("express-rate-limit");
const config = require("../config/config");

/**
 * General limiter applied to all /api routes.
 */
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});

/**
 * Stricter limiter for auth endpoints (login/signup/forgot-password)
 * to slow down brute-force and credential-stuffing attempts.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts. Please try again in 15 minutes." },
});

/**
 * Even stricter limiter for AI endpoints (to control API cost from Gemini/OpenAI).
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many AI requests. Please slow down." },
});

/**
 * Judge0 calls cost real API quota/money — keep this tighter than the general
 * API limiter. 15 executions/minute is generous for a single user solving
 * problems, but stops runaway loops or scripted abuse.
 */
const executionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many code executions. Please wait a moment before running again." },
});

module.exports = { apiLimiter, authLimiter, aiLimiter, executionLimiter };
