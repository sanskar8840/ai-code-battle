const asyncHandler = require("express-async-handler");
const Problem = require("../models/Problem");
const Submission = require("../models/Submission");
const ApiError = require("../utils/ApiError");
const sendResponse = require("../utils/ApiResponse");
const judge0Service = require("../services/judge0Service");
const { aggregateResults } = require("../services/gradingService");
const { getLanguageById } = require("../config/languages");
const checkAchievements = require("../utils/checkAchievements");
const UserBehavior = require("../models/UserBehavior");
const loadPublishedProblem = async (idOrSlug, { withHidden = false } = {}) => {
  const isObjectId = /^[a-f\d]{24}$/i.test(idOrSlug);
  const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

  let problemQuery = Problem.findOne(query);
  if (withHidden) problemQuery = problemQuery.select("+hiddenTestCases");

  const problem = await problemQuery;
  if (!problem || !problem.isPublished) {
    throw new ApiError("Problem not found", 404);
  }
  return problem;
};

const validateLanguageSupported = (problem, language) => {
  if (!getLanguageById(language)) {
    throw new ApiError(`Unsupported language: ${language}`, 400);
  }
  if (!problem.supportedLanguages.includes(language)) {
    throw new ApiError(`This problem does not support ${language}`, 400);
  }
};

// @desc    Run code against the problem's visible example test cases only.
//          Does NOT create a Submission record — this is a scratch "try it" run.
// @route   POST /api/execute/run
// @access  Private
const runCode = asyncHandler(async (req, res) => {
  const { problemId, language, code } = req.body;

  if (!problemId || !language || typeof code !== "string" || !code.trim()) {
    throw new ApiError("problemId, language, and code are all required", 400);
  }

  const problem = await loadPublishedProblem(problemId);
  validateLanguageSupported(problem, language);

  const testCases = problem.examples.map((ex) => ({ input: ex.input, expectedOutput: ex.output }));

  let results;
  try {
    results = await judge0Service.runTestCases({
      language,
      sourceCode: code,
      testCases,
      timeLimitMs: problem.timeLimitMs,
      memoryLimitKb: problem.memoryLimitKb,
    });
  } catch (err) {
    throw new ApiError(err.message || "Code execution failed", 502);
  }

  const { overallStatus, passed, total } = aggregateResults(results);
  console.log("Results:", results);
console.log("Overall Status:", overallStatus);

  sendResponse(res, 200, "Run complete", {
    status: overallStatus,
    passed,
    total,
    results: results.map((r, i) => ({
      testCaseNumber: i + 1,
      input: r.input,
      expectedOutput: r.expectedOutput,
      actualOutput: r.stdout,
      status: r.status,
      stderr: r.stderr || undefined,
      compileOutput: r.compileOutput || undefined,
      runtimeMs: r.runtimeMs,
      memoryKb: r.memoryKb,
    })),
  });
});

// @desc    Submit code for full grading against visible + hidden test cases.
//          Creates a Submission record and updates problem/user stats.
// @route   POST /api/execute/submit
// @access  Private
const submitCode = asyncHandler(async (req, res) => {
  const { problemId, language, code } = req.body;

  if (!problemId || !language || typeof code !== "string" || !code.trim()) {
    throw new ApiError("problemId, language, and code are all required", 400);
  }

  const problem = await loadPublishedProblem(problemId, { withHidden: true });
  validateLanguageSupported(problem, language);

  const visibleCount = problem.examples.length;
  const testCases = [
    ...problem.examples.map((ex) => ({ input: ex.input, expectedOutput: ex.output })),
    ...(problem.hiddenTestCases || []).map((tc) => ({ input: tc.input, expectedOutput: tc.output })),
  ];

  if (testCases.length === 0) {
    throw new ApiError("This problem has no test cases configured yet", 500);
  }

  let results;
  try {
    results = await judge0Service.runTestCases({
      language,
      sourceCode: code,
      testCases,
      timeLimitMs: problem.timeLimitMs,
      memoryLimitKb: problem.memoryLimitKb,
    });
  } catch (err) {
    throw new ApiError(err.message || "Code execution failed", 502);
  }

  const { overallStatus, passed, total, maxRuntimeMs, maxMemoryKb } = aggregateResults(results);

  // --- Persist the submission ---
  const submission = await Submission.create({
    user: req.user._id,
    problem: problem._id,
    problemTitle: problem.title,
    difficulty: problem.difficulty,
    tags: problem.tags,
    language,
    code,
    status: overallStatus,
    runtimeMs: maxRuntimeMs,
    memoryKb: maxMemoryKb,
    testCasesPassed: passed,
    testCasesTotal: total,
  });


  // -------- Save User Behavior for ML --------
await UserBehavior.create({
  user: req.user._id,
  problem: problem._id,

  difficulty: problem.difficulty,

  tags: problem.tags,

  language,

  accepted: overallStatus === "Accepted",

  executionTime: maxRuntimeMs,

  memory: maxMemoryKb,
});





  // --- Update problem-level acceptance stats ---
  problem.totalSubmissions += 1;
  if (overallStatus === "Accepted") problem.totalAccepted += 1;
  problem.recomputeAcceptanceRate();
  await problem.save();

  // --- Update user stats on a first-time accepted solve ---
  let newlySolved = false;
 let unlockedAchievements = [];

if (overallStatus === "Accepted") {
  newlySolved = req.user.registerSolve(problem._id);

  if (newlySolved) {
    unlockedAchievements = await checkAchievements(req.user);

    await req.user.save({
      validateBeforeSave: false,
    });
  }
}

  // --- Only expose visible-test-case detail; hidden cases stay aggregate-only ---
  const visibleResults = results.slice(0, visibleCount).map((r, i) => ({
    testCaseNumber: i + 1,
    input: r.input,
    expectedOutput: r.expectedOutput,
    actualOutput: r.stdout,
    status: r.status,
    stderr: r.stderr || undefined,
    compileOutput: r.compileOutput || undefined,
    runtimeMs: r.runtimeMs,
    memoryKb: r.memoryKb,
  }));
  const hiddenPassed = passed - visibleResults.filter((r) => r.status === "Accepted").length;
  const hiddenTotal = total - visibleCount;

  sendResponse(res, 201, "Submission graded", {
    submissionId: submission._id,
    status: overallStatus,
    passed,
    total,
    runtimeMs: maxRuntimeMs,
    memoryKb: maxMemoryKb,
    visibleResults,
    hiddenSummary: { passed: hiddenPassed, total: hiddenTotal },
    newlySolved,
    unlockedAchievements,
  });
});

module.exports = { runCode, submitCode };
