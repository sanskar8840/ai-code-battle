const mongoose = require("mongoose");

const SUPPORTED_LANGUAGES = ["cpp", "java", "python", "javascript", "c"];

const exampleSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String, default: "" },
  },
  { _id: false }
);

const hiddenTestCaseSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: [true, "Difficulty is required"],
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    companies: [{ type: String, trim: true }],

    constraints: [{ type: String }],
    inputFormat: { type: String, default: "" },
    outputFormat: { type: String, default: "" },

    examples: {
      type: [exampleSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one example is required",
      },
    },

    // Never returned by default queries — only pulled explicitly by the
    // Judge0 execution service (Phase 8) or an admin editing the problem.
    hiddenTestCases: {
      type: [hiddenTestCaseSchema],
      select: false,
    },

    starterCode: {
      cpp: { type: String, default: "" },
      java: { type: String, default: "" },
      python: { type: String, default: "" },
      javascript: { type: String, default: "" },
      c: { type: String, default: "" },
    },
    supportedLanguages: {
      type: [{ type: String, enum: SUPPORTED_LANGUAGES }],
      default: SUPPORTED_LANGUAGES,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one supported language is required",
      },
    },

    timeLimitMs: { type: Number, default: 2000, min: 100 },
    memoryLimitKb: { type: Number, default: 262144, min: 16384 }, // 256MB default

    acceptanceRate: { type: Number, default: 0, min: 0, max: 100 },
    totalSubmissions: { type: Number, default: 0 },
    totalAccepted: { type: Number, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// --- Text index for search, plus common filter indexes ---
problemSchema.index({ title: "text", tags: "text" });
problemSchema.index({ difficulty: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ companies: 1 });
problemSchema.index({ isPublished: 1 });

// --- Slug generation: derived from title, de-duplicated with a numeric suffix
// if a collision exists. Only regenerates when the title changes. ---
problemSchema.pre("validate", async function (next) {
  if (!this.isModified("title") && this.slug) return next();

  const base = this.title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  let candidate = base;
  let suffix = 1;
  const Problem = this.constructor;

  // eslint-disable-next-line no-await-in-loop
  while (await Problem.exists({ slug: candidate, _id: { $ne: this._id } })) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  this.slug = candidate;
  next();
});

problemSchema.methods.recomputeAcceptanceRate = function () {
  if (this.totalSubmissions === 0) {
    this.acceptanceRate = 0;
  } else {
    this.acceptanceRate = Math.round((this.totalAccepted / this.totalSubmissions) * 1000) / 10;
  }
};

module.exports = mongoose.model("Problem", problemSchema);
module.exports.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;
