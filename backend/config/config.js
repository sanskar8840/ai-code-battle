require("dotenv").config();

/**
 * Central place all env vars are read from.
 * Fail fast in production if a required secret is missing.
 */
const required = ["MONGO_URI", "JWT_SECRET"];

if (process.env.NODE_ENV === "production") {
  required.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });
}

module.exports = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  mongoUri: process.env.MONGO_URI,

  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || "7d",
    cookieExpireDays: Number(process.env.JWT_COOKIE_EXPIRE) || 7,
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || "30d",
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    fromEmail: process.env.FROM_EMAIL || "noreply@aicodebattlearena.com",
    fromName: process.env.FROM_NAME || "AI Code Battle Ground Arena",
  },

  judge0: {
    apiUrl: process.env.JUDGE0_API_URL,
    apiKey: process.env.JUDGE0_API_KEY,
    apiHost: process.env.JUDGE0_API_HOST,
  },

  ai: {
    provider: process.env.AI_PROVIDER || "gemini",
    geminiKey: process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    openaiKey: process.env.OPENAI_API_KEY,
    openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 200,
  },
};
