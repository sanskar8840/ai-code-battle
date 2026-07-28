const asyncHandler = require("express-async-handler");

const Problem = require("../models/Problem");
const Submission = require("../models/Submission");
const mlService = require("../services/mlService");

const getRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // -------------------------
  // Load User Submissions
  // -------------------------

  const submissions = await Submission.find({
    user: userId,
  }).populate("problem");

  // -------------------------
  // New User
  // -------------------------

  if (submissions.length === 0) {
    try {
      const recommendations =
        await mlService.getMLRecommendations({
          favoriteTags: [],
          difficulty: {},
          solvedProblems: [],
        });

      recommendations.sort(
        (a, b) => b.finalScore - a.finalScore
      );

      return res.json({
        success: true,
        favoriteTags: [],
        recommendations,
      });
    } catch (err) {
      const recommendations = await Problem.find({
        isPublished: true,
      })
        .limit(10)
        .select(
          "title slug difficulty tags acceptanceRate"
        );

      return res.json({
        success: true,
        favoriteTags: [],
        recommendations,
      });
    }
  }

  // -------------------------
  // Rule Based Data
  // -------------------------

  const solvedProblemIds = new Set();

  const tagFrequency = {};

  const difficultyFrequency = {};

  submissions.forEach((submission) => {
    solvedProblemIds.add(
      submission.problem._id.toString()
    );

    difficultyFrequency[
      submission.problem.difficulty
    ] =
      (difficultyFrequency[
        submission.problem.difficulty
      ] || 0) + 1;

    submission.problem.tags.forEach((tag) => {
      tagFrequency[tag] =
        (tagFrequency[tag] || 0) + 1;
    });
  });

  const favoriteTags = Object.keys(tagFrequency)
    .sort(
      (a, b) =>
        tagFrequency[b] - tagFrequency[a]
    )
    .slice(0, 3);

  // -------------------------
  // Rule Recommendation Score
  // -------------------------

  let problems = await Problem.find({
    _id: {
      $nin: [...solvedProblemIds],
    },
    isPublished: true,
  });

  problems = problems.map((problem) => {
    let score = 0;

    problem.tags.forEach((tag) => {
      if (favoriteTags.includes(tag)) {
        score += 5;
      }
    });

    if (
      difficultyFrequency[problem.difficulty]
    ) {
      score += 3;
    }

    score +=
      (problem.acceptanceRate || 0) / 20;

    return {
      ...problem.toObject(),
      score,
    };
  });

  problems.sort((a, b) => b.score - a.score);

  // -------------------------
  // Normalize Rule Score
  // -------------------------

  const maxRuleScore = Math.max(
    ...problems.map((p) => p.score),
    1
  );

  problems = problems.map((problem) => ({
    ...problem,
    normalizedRuleScore:
      problem.score / maxRuleScore,
  }));

  // -------------------------
  // Personalized ML
  // -------------------------

  try {
 console.log("=========== USER DATA ===========");

console.log({
  favoriteTags,
  difficulty: difficultyFrequency,
  solvedProblems: [...solvedProblemIds],
});

console.log("===============================");

const mlRecommendations =
  await mlService.getMLRecommendations({
    favoriteTags,
    difficulty: difficultyFrequency,
    solvedProblems: [...solvedProblemIds],
  });
  
    const merged = mlRecommendations.map(
      (mlProblem) => {
        const ruleProblem = problems.find(
          (p) => p.slug === mlProblem.slug
        );

        return {
          ...mlProblem,

          score: ruleProblem
            ? ruleProblem.score
            : 0,

          normalizedRuleScore:
            ruleProblem
              ? ruleProblem.normalizedRuleScore
              : 0,

          reason: favoriteTags.some((tag) =>
            mlProblem.tags.includes(tag)
          )
            ? "Matches your favorite topic"
            : "High AI confidence",
        };
      }
    );

    merged.sort(
      (a, b) => b.finalScore - a.finalScore
    );

    console.log(
      "Top Recommendation:",
      merged[0]
    );

    return res.json({
      success: true,
      favoriteTags,
      recommendations: merged,
    });
  } catch (err) {
    console.log(
      "========== ML ERROR =========="
    );
    console.error(err);
    console.log(
      "========== END =========="
    );

    return res.json({
      success: true,
      favoriteTags,
      recommendations: problems.slice(0, 10),
    });
  }
});

module.exports = {
  getRecommendations,
};