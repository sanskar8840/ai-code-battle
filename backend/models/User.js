const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const config = require("../config/config");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    avatar: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    country: { type: String, default: "" },
    bio: { type: String, maxlength: 300, default: "" },
    college: { type: String, default: "" },
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    skills: [{ type: String }],

    // --- Competitive stats ---
    rating: { type: Number, default: 1200 },
    problemsSolved: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }],
    battlesWon: { type: Number, default: 0 },
    battlesLost: { type: Number, default: 0 },
    battlesDrawn: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastSolvedDate: { type: Date, default: null },
    badges: [{ type: String }],



    achievements: [
{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Achievement",
}
],

xp: {
    type: Number,
    default: 0,
},

level: {
    type: Number,
    default: 1,
},

    // --- Topic proficiency, updated by submission/analytics logic in Phase 12-13 ---
    weakTopics: [{ type: String }],
    strongTopics: [{ type: String }],

    // --- Auth support fields ---
    isEmailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
    refreshToken: { type: String, select: false },

    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for frequent lookups (rating for leaderboard sort, text search)
userSchema.index({ rating: -1 });
userSchema.index({ name: "text", username: "text" });

// --- Hash password before save ---
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// --- Instance methods ---
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, config.jwt.secret, {
    expiresIn: config.jwt.expire,
  });
};

userSchema.methods.getRefreshToken = function () {
  return jwt.sign({ id: this._id }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpire,
  });
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken; // unhashed version is emailed to the user
};

userSchema.methods.winRate = function () {
  const total = this.battlesWon + this.battlesLost + this.battlesDrawn;
  if (total === 0) return 0;
  return Math.round((this.battlesWon / total) * 100);
};

/**
 * Records a first-time accepted solve: adds the problem to problemsSolved,
 * and updates the daily streak. Idempotent — calling it again for a problem
 * the user already solved does nothing (re-solving doesn't inflate the count
 * or double the streak day).
 */
userSchema.methods.registerSolve = function (problemId) {
  const alreadySolved = this.problemsSolved.some((id) => id.equals(problemId));
  if (alreadySolved) return false;

  this.problemsSolved.push(problemId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (this.lastSolvedDate) {
    const last = new Date(this.lastSolvedDate);
    last.setHours(0, 0, 0, 0);
    const dayDiff = Math.round((today - last) / (1000 * 60 * 60 * 24));

    if (dayDiff === 0) {
      // Already solved something today — streak doesn't change.
    } else if (dayDiff === 1) {
      this.currentStreak += 1;
    } else {
      this.currentStreak = 1;
    }
  } else {
    this.currentStreak = 1;
  }

  this.lastSolvedDate = today;
  this.longestStreak = Math.max(this.longestStreak, this.currentStreak);

  return true;
};

// Never leak sensitive fields even if select() is misused elsewhere
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  delete obj.refreshToken;
  delete obj.emailVerifyToken;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
