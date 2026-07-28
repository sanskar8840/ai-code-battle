const mongoose = require("mongoose");

/**
 * Full real-time battle record (Phase 9). Extends the lightweight Phase 5/6
 * version — every field that dashboardController.js and RecentBattles.jsx
 * already read (players[].user/ratingBefore/ratingAfter/result, problem,
 * problemTitle, difficulty, winner, status, durationSeconds, createdAt) is
 * kept exactly as-is, so nothing upstream breaks.
 */
const chatMessageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, maxlength: 500 },
    sentAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const battleSubmissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    submission: { type: mongoose.Schema.Types.ObjectId, ref: "Submission" },
    language: { type: String, required: true },
    status: { type: String, required: true },
    passed: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const battleSchema = new mongoose.Schema(
  {
    roomId: { type: String, unique: true, sparse: true, index: true },

    players: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        ratingBefore: { type: Number, required: true },
        ratingAfter: { type: Number, required: true },
        result: { type: String, enum: ["win", "loss", "draw"], required: true },
        finalStatus: { type: String, default: null }, // e.g. "Accepted", "Wrong Answer", null if never submitted
        testCasesPassed: { type: Number, default: 0 },
        testCasesTotal: { type: Number, default: 0 },
        submissionCount: { type: Number, default: 0 },
        solvedAt: { type: Date, default: null },
        disconnected: { type: Boolean, default: false },
        forfeited: { type: Boolean, default: false },
      },
    ],

    problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
    problemTitle: { type: String, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },

    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    loser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // Final historical outcome (kept for backward compatibility with Phase 5/6 dashboard queries)
    status: {
      type: String,
      enum: ["completed", "aborted", "draw"],
      default: "completed",
    },

    // Live lifecycle state — mainly meaningful while the battle is in progress;
    // for finished battles this settles on "finished" or "aborted".
    battleStatus: {
      type: String,
      enum: ["waiting", "ready", "countdown", "in_progress", "finished", "aborted"],
      default: "waiting",
    },

    startTime: { type: Date },
    endTime: { type: Date },
    durationSeconds: { type: Number },

    submissions: [battleSubmissionSchema],
    ratingChanges: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        before: Number,
        after: Number,
        delta: Number,
      },
    ],
    chatHistory: [chatMessageSchema],

    isRematch: { type: Boolean, default: false },
    rematchOf: { type: mongoose.Schema.Types.ObjectId, ref: "Battle", default: null },
  },
  { timestamps: true }
);

battleSchema.index({ "players.user": 1, createdAt: -1 });

module.exports = mongoose.model("Battle", battleSchema);
