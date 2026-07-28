const asyncHandler = require("express-async-handler");
const Problem = require("../models/Problem");
const ApiError = require("../utils/ApiError");
const sendResponse = require("../utils/ApiResponse");
const { LANGUAGES, getLanguageById } = require("../config/languages");

const PUBLIC_LIST_FIELDS =
  "title slug difficulty tags companies acceptanceRate totalSubmissions isPublished createdAt";

// @desc    List problems with search, filters, sort, pagination
// @route   GET /api/problems?search=&difficulty=&tags=&companies=&sort=&page=&limit=
// @access  Public (unpublished problems only visible to admins)
const getProblems = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const { search, difficulty, tags, companies, sort } = req.query;

  const filter = {};

  // Non-admins only ever see published problems.
  if (!req.user || req.user.role !== "admin") {
    filter.isPublished = true;
  } else if (req.query.status === "published") {
    filter.isPublished = true;
  } else if (req.query.status === "draft") {
    filter.isPublished = false;
  }

  if (search) {
    filter.$text = { $search: search };
  }
  if (difficulty) {
    filter.difficulty = { $in: difficulty.split(",") };
  }
  if (tags) {
    filter.tags = { $in: tags.split(",").map((t) => t.trim().toLowerCase()) };
  }
  if (companies) {
    filter.companies = { $in: companies.split(",").map((c) => c.trim()) };
  }

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    "title-asc": { title: 1 },
    "title-desc": { title: -1 },
    "acceptance-asc": { acceptanceRate: 1 },
    "acceptance-desc": { acceptanceRate: -1 },
    "difficulty-asc": { difficulty: 1 },
    "difficulty-desc": { difficulty: -1 },
  };
  const sortOption = sortMap[sort] || sortMap.newest;

  const [problems, total] = await Promise.all([
    Problem.find(filter)
      .select(PUBLIC_LIST_FIELDS)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit),
    Problem.countDocuments(filter),
  ]);

  sendResponse(res, 200, "Problems fetched", {
    problems,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Get a single problem by slug or ID (hidden test cases excluded unless admin)
// @route   GET /api/problems/:idOrSlug
// @access  Public (unpublished only visible to admins)
const getProblem = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const isObjectId = /^[a-f\d]{24}$/i.test(idOrSlug);
  const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

  const isAdmin = req.user?.role === "admin";
  let problemQuery = Problem.findOne(query);
  if (isAdmin) {
    problemQuery = problemQuery.select("+hiddenTestCases");
  }

  const problem = await problemQuery.populate("createdBy", "name username");

  if (!problem) {
    throw new ApiError("Problem not found", 404);
  }
  if (!problem.isPublished && !isAdmin) {
    throw new ApiError("Problem not found", 404);
  }

  sendResponse(res, 200, "Problem fetched", { problem });
});

// @desc    Create a new problem
// @route   POST /api/problems
// @access  Private/Admin
const createProblem = asyncHandler(async (req, res) => {
  const problem = await Problem.create({ ...req.body, createdBy: req.user._id });
  sendResponse(res, 201, "Problem created", { problem });
});

// @desc    Update a problem
// @route   PUT /api/problems/:id
// @access  Private/Admin
const updateProblem = asyncHandler(async (req, res) => {
  const problem = await Problem.findById(req.params.id);
  if (!problem) {
    throw new ApiError("Problem not found", 404);
  }

  const updatable = [
    "title",
    "description",
    "difficulty",
    "tags",
    "companies",
    "constraints",
    "inputFormat",
    "outputFormat",
    "examples",
    "hiddenTestCases",
    "starterCode",
    "supportedLanguages",
    "timeLimitMs",
    "memoryLimitKb",
    "isPublished",
  ];

  updatable.forEach((field) => {
    if (req.body[field] !== undefined) problem[field] = req.body[field];
  });

  await problem.save();
  sendResponse(res, 200, "Problem updated", { problem });
});

// @desc    Delete a problem
// @route   DELETE /api/problems/:id
// @access  Private/Admin
const deleteProblem = asyncHandler(async (req, res) => {
  const problem = await Problem.findById(req.params.id);
  if (!problem) {
    throw new ApiError("Problem not found", 404);
  }

  await problem.deleteOne();
  sendResponse(res, 200, "Problem deleted");
});

// @desc    Distinct tags/companies + per-difficulty counts, for building filter UI
// @route   GET /api/problems/meta/filters
// @access  Public
const getFilterMeta = asyncHandler(async (req, res) => {
  const filter = req.user?.role === "admin" ? {} : { isPublished: true };

  const [tags, companies, difficultyCounts] = await Promise.all([
    Problem.distinct("tags", filter),
    Problem.distinct("companies", filter),
    Problem.aggregate([{ $match: filter }, { $group: { _id: "$difficulty", count: { $sum: 1 } } }]),
  ]);

  sendResponse(res, 200, "Filter metadata fetched", {
    tags: tags.sort(),
    companies: companies.sort(),
    difficultyCounts,
  });
});

// @desc    Starter code for a single problem, in a single language (or all
//          supported languages if none specified). Falls back to the
//          language's default template if the problem hasn't set its own.
// @route   GET /api/problems/:idOrSlug/starter-code?language=python
// @access  Public (unpublished only visible to admins)
const getStarterCode = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const { language } = req.query;
  const isObjectId = /^[a-f\d]{24}$/i.test(idOrSlug);
  const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

  const problem = await Problem.findOne(query).select("starterCode supportedLanguages isPublished");

  if (!problem) {
    throw new ApiError("Problem not found", 404);
  }
  if (!problem.isPublished && req.user?.role !== "admin") {
    throw new ApiError("Problem not found", 404);
  }

  if (language) {
    if (!getLanguageById(language)) {
      throw new ApiError(`Unsupported language: ${language}`, 400);
    }
    const langDefault = getLanguageById(language).defaultTemplate;
    const code = problem.starterCode?.[language] || langDefault;
    return sendResponse(res, 200, "Starter code fetched", { language, code });
  }

  // No language specified — return the full map, filling gaps with defaults
  // for every language this problem supports.
  const codeByLanguage = {};
  (problem.supportedLanguages?.length ? problem.supportedLanguages : LANGUAGES.map((l) => l.id)).forEach(
    (langId) => {
      codeByLanguage[langId] = problem.starterCode?.[langId] || getLanguageById(langId)?.defaultTemplate || "";
    }
  );

  sendResponse(res, 200, "Starter code fetched", { starterCode: codeByLanguage });
});

module.exports = {
  getProblems,
  getProblem,
  createProblem,
  updateProblem,
  deleteProblem,
  getFilterMeta,
  getStarterCode,
};
