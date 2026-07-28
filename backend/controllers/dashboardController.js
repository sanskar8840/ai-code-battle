const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Submission = require("../models/Submission");
const Battle = require("../models/Battle");
const sendResponse = require("../utils/ApiResponse");

// @desc    Core dashboard stats (cards at the top of the dashboard)
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [totalSubmissions, acceptedSubmissions, totalBattles] = await Promise.all([
    Submission.countDocuments({ user: userId }),
    Submission.countDocuments({ user: userId, status: "Accepted" }),
    Battle.countDocuments({ "players.user": userId }),
  ]);

  const accuracy = totalSubmissions === 0 ? 0 : Math.round((acceptedSubmissions / totalSubmissions) * 100);

  sendResponse(res, 200, "Dashboard stats fetched", {
    rating: req.user.rating,
    problemsSolved: req.user.problemsSolved?.length ?? 0,
    battlesWon: req.user.battlesWon,
    battlesLost: req.user.battlesLost,
    battlesDrawn: req.user.battlesDrawn,
    currentStreak: req.user.currentStreak,
    longestStreak: req.user.longestStreak,
    badges: req.user.badges,
    totalSubmissions,
    totalBattles,
    accuracy,
  });
});

// @desc    Chart data: submission trend (last 30 days), difficulty distribution,
//          language usage, and a GitHub-style submission heatmap (last 365 days)
// @route   GET /api/dashboard/charts
// @access  Private
const getChartData = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);
  const oneYearAgo = new Date();
  oneYearAgo.setDate(oneYearAgo.getDate() - 365);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [trend, difficultyDist, languageUsage, heatmap] = await Promise.all([
    // Submissions per day, last 30 days
    Submission.aggregate([
      { $match: { user: userId, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ["$status", "Accepted"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Solved-problem difficulty breakdown
    Submission.aggregate([
      { $match: { user: userId, status: "Accepted" } },
      { $group: { _id: "$difficulty", count: { $addToSet: "$problemTitle" } } },
      { $project: { _id: 1, count: { $size: "$count" } } },
    ]),

    // Language usage across all submissions
    Submission.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$language", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // Daily submission counts, last 365 days (for the contribution-style heatmap)
    Submission.aggregate([
      { $match: { user: userId, createdAt: { $gte: oneYearAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  sendResponse(res, 200, "Chart data fetched", {
    submissionTrend: trend,
    difficultyDistribution: difficultyDist,
    languageUsage,
    heatmap,
  });
});

// @desc    Recent submissions (default 5)
// @route   GET /api/dashboard/recent-submissions
// @access  Private
const getRecentSubmissions = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 5, 20);

  const submissions = await Submission.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("-code");

  sendResponse(res, 200, "Recent submissions fetched", { submissions });
});

// @desc    Recent battles (default 5)
// @route   GET /api/dashboard/recent-battles
// @access  Private
const getRecentBattles = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 5, 20);

  const battles = await Battle.find({ "players.user": req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("players.user", "name username avatar")
    .populate("winner", "name username");

  sendResponse(res, 200, "Recent battles fetched", { battles });
});

// @desc    Merged activity timeline: submissions + battles, newest first
// @route   GET /api/dashboard/activity
// @access  Private
const getActivityTimeline = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 15, 50);

  const [submissions, battles] = await Promise.all([
    Submission.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("-code"),
    Battle.find({ "players.user": req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("winner", "name username"),
  ]);

  const events = [
    ...submissions.map((s) => ({
      type: "submission",
      id: s._id,
      status: s.status,
      problemTitle: s.problemTitle,
      difficulty: s.difficulty,
      language: s.language,
      createdAt: s.createdAt,
    })),
    ...battles.map((b) => ({
      type: "battle",
      id: b._id,
      problemTitle: b.problemTitle,
      difficulty: b.difficulty,
      winner: b.winner,
      status: b.status,
      createdAt: b.createdAt,
    })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  sendResponse(res, 200, "Activity timeline fetched", { events: events.slice(0, limit) });
});

module.exports = {
  getStats,
  getChartData,
  getRecentSubmissions,
  getRecentBattles,
  getActivityTimeline,
};
