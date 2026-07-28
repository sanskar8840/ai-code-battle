const asyncHandler = require("express-async-handler");
const Achievement = require("../models/Achievement");
const User = require("../models/User");
const ApiResponse = require("../utils/ApiResponse");

const getAchievements = asyncHandler(async (req, res) => {
  const achievements = await Achievement.find().sort({ xpReward: 1 });

  // Agar user login nahi hai to sab locked dikhenge
  if (!req.user) {
    const data = achievements.map((achievement) => ({
      ...achievement.toObject(),
      unlocked: false,
      progress: 0,
    }));

    return ApiResponse(res, 200, "Achievements fetched successfully", {
      achievements: data,
    });
  }

  const user = await User.findById(req.user.id);

  const data = achievements.map((achievement) => {
    let current = 0;

    switch (achievement.condition) {
      case "problemsSolved":
        current = user.problemsSolved.length;
        break;

      case "battlesWon":
        current = user.battlesWon;
        break;

      case "rating":
        current = user.rating;
        break;

      case "currentStreak":
        current = user.currentStreak;
        break;

      default:
        current = 0;
    }

    return {
      ...achievement.toObject(),
      progress: current,
      unlocked: current >= achievement.value,
    };
  });

  ApiResponse(res, 200, "Achievements fetched successfully", {
    achievements: data,
  });
});

module.exports = {
  getAchievements,
};