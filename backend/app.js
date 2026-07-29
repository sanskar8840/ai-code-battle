const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const config = require("./config/config");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { apiLimiter } = require("./middleware/rateLimitMiddleware");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const problemRoutes = require("./routes/problemRoutes");
const languageRoutes = require("./routes/languageRoutes");
const executionRoutes = require("./routes/executionRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const battleRoutes = require("./routes/battleRoutes");
const achievementRoutes = require("./routes/achievementRoutes");
const aiRoutes = require("./routes/aiRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const connectDB = require("./config/db");
const Problem = require("./models/Problem");
const User = require("./models/User");
const PROBLEMS = require("./seed/problems");

const app = express();

// Security & parsing middleware
app.use(helmet());

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());

if (config.env === "development") {
  app.use(morgan("dev"));
}

app.use("/api", apiLimiter);

// =========================
// ROOT ROUTE
// =========================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 AI Code Battle Arena Backend is Live!",
    version: "1.0.0",
    health: "/api/health",
  });
});

// =========================
// HEALTH CHECK
// =========================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Code Battle Arena API is running",
  });
});

app.get("/api/seed", async (req, res) => {
  try {
    await connectDB();

    await Problem.deleteMany({});

    let admin = await User.findOne({
      email: "Sanskaryadav578@gmail.com",
    });

    if (!admin) {
      admin = await User.create({
        name: "Seed Admin",
        username: "seed_admin",
        email: "Sanskaryadav578@gmail.com",
        password: "ChangeMe123!",
        role: "admin",
      });
    }

    const docs = PROBLEMS.map((p) => ({
      ...p,
      createdBy: admin._id,
    }));

    await Problem.insertMany(docs);

    res.json({
      success: true,
      inserted: docs.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// =========================
// API ROUTES
// =========================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/languages", languageRoutes);
app.use("/api/execute", executionRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/battles", battleRoutes);
app.use("/api/achievements", achievementRoutes);

console.log("AI routes loaded");

app.use("/api/ai", aiRoutes);
app.use("/api/recommendations", recommendationRoutes);

// =========================
// ERROR HANDLING
// =========================
app.use(notFound);
app.use(errorHandler);

module.exports = app;