const Achievement = require("../models/Achievement");

/**
 * Check and unlock achievements for a user.
 * Returns the list of newly unlocked achievements.
 */
const checkAchievements = async (user) => {
  const achievements = await Achievement.find();
  const newlyUnlocked = [];

  for (const achievement of achievements) {
    // Skip if already unlocked
    if (user.badges.includes(achievement.title)) {
      continue;
    }

    let currentValue = 0;

    switch (achievement.condition) {
      case "problemsSolved":
        currentValue = user.problemsSolved.length;
        break;

      case "battlesWon":
        currentValue = user.battlesWon;
        break;

      case "rating":
        currentValue = user.rating;
        break;

      case "currentStreak":
        currentValue = user.currentStreak;
        break;

      default:
        currentValue = 0;
    }

    if (currentValue >= achievement.value) {
      user.badges.push(achievement.title);
      newlyUnlocked.push({
        title: achievement.title,
        icon: achievement.icon,
        xpReward: achievement.xpReward,
      });
    }
  }

  await user.save();

  return newlyUnlocked;
};

module.exports = checkAchievements;