const mongoose = require("mongoose");

/**
 * problemId now points at a real Problem document (Phase 6). Title/difficulty/tags
 * stay denormalized onto the submission itself as a point-in-time snapshot — if a
 * problem's title or difficulty is edited later, past submissions still show what
 * they looked like when the user actually solved them.
 */
const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true, index: true },
    problemTitle: { type: String, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    tags: [{ type: String }],

    language: {
      type: String,
      enum: ["cpp", "java", "python", "javascript", "c"],
      required: true,
    },
    code: { type: String, select: false }, // stored but not returned by default (can be large)
    status: {
      type: String,
     enum: [
              "Accepted",
              "Wrong Answer",
              "Time Limit Exceeded",
              "Runtime Error",
              "Compilation Error",
              "Memory Limit Exceeded",
              "Internal Error",
              "Exec Format Error",
              "Processing"
            ],
      required: true,
    },
    runtimeMs: { type: Number },
    memoryKb: { type: Number },
    testCasesPassed: { type: Number, default: 0 },
    testCasesTotal: { type: Number, default: 0 },
  },
  { timestamps: true }
);

submissionSchema.index({ user: 1, createdAt: -1 });
submissionSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("Submission", submissionSchema);
