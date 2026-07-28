const asyncHandler = require("express-async-handler");
const Submission = require("../models/Submission");
const ApiError = require("../utils/ApiError");
const sendResponse = require("../utils/ApiResponse");
const UserBehavior = require("../models/UserBehavior");

// @desc    List the logged-in user's own submissions, optionally filtered by problem
// @route   GET /api/submissions?problemId=&status=&page=&limit=
// @access  Private
const getMySubmissions = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const filter = { user: req.user._id };
  if (req.query.problemId) filter.problem = req.query.problemId;
  if (req.query.status) filter.status = req.query.status;

  const [submissions, total] = await Promise.all([
    Submission.find(filter)
      .select("-code")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Submission.countDocuments(filter),
  ]);

  sendResponse(res, 200, "Submissions fetched", {
    submissions,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Get a single submission with full source code
// @route   GET /api/submissions/:id
// @access  Private (owner or admin only)
const getSubmissionById = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id).select("+code");

  if (!submission) {
    throw new ApiError("Submission not found", 404);
  }

  const isOwner = submission.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new ApiError("You don't have permission to view this submission", 403);
  }

  sendResponse(res, 200, "Submission fetched", { submission });
});

module.exports = { getMySubmissions, getSubmissionById };
