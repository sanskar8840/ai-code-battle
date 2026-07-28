const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Achievement = require("../models/Achievement");

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const achievements = [
  {
    title: "First Blood",
    description: "Solve your first problem",
    icon: "🥉",
    color: "#22C55E",
    xpReward: 100,
    condition: "problemsSolved",
    value: 1,
  },
  {
    title: "Beginner",
    description: "Solve 10 problems",
    icon: "🥈",
    color: "#3B82F6",
    xpReward: 250,
    condition: "problemsSolved",
    value: 10,
  },
  {
    title: "Intermediate",
    description: "Solve 50 problems",
    icon: "🥇",
    color: "#F59E0B",
    xpReward: 500,
    condition: "problemsSolved",
    value: 50,
  },
  {
    title: "Expert",
    description: "Solve 100 problems",
    icon: "🏆",
    color: "#EF4444",
    xpReward: 1000,
    condition: "problemsSolved",
    value: 100,
  },
  {
    title: "Warrior",
    description: "Win 10 battles",
    icon: "⚔️",
    color: "#8B5CF6",
    xpReward: 300,
    condition: "battlesWon",
    value: 10,
  },
  {
    title: "Champion",
    description: "Win 50 battles",
    icon: "👑",
    color: "#EAB308",
    xpReward: 800,
    condition: "battlesWon",
    value: 50,
  },
  {
    title: "Legend",
    description: "Reach 2000 rating",
    icon: "🌟",
    color: "#F97316",
    xpReward: 1500,
    condition: "rating",
    value: 2000,
  },
  {
    title: "7 Day Streak",
    description: "Maintain a 7-day solving streak",
    icon: "🔥",
    color: "#DC2626",
    xpReward: 500,
    condition: "currentStreak",
    value: 7,
  },
  {
    title: "30 Day Streak",
    description: "Maintain a 30-day solving streak",
    icon: "🚀",
    color: "#7C3AED",
    xpReward: 2000,
    condition: "currentStreak",
    value: 30,
  },
  {
    title: "Code Master",
    description: "Solve 250 problems",
    icon: "💎",
    color: "#06B6D4",
    xpReward: 3000,
    condition: "problemsSolved",
    value: 250,
  },
];

async function seedAchievements() {
  try {
    await Achievement.deleteMany();

    await Achievement.insertMany(achievements);

    console.log("✅ Achievements Seeded Successfully");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedAchievements();