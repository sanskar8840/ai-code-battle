const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },

    description: {
      type: String,
      required: true,
    },

    icon: {
      type: String,
      default: "🏅",
    },

    color: {
      type: String,
      default: "#8B5CF6",
    },

    xpReward: {
      type: Number,
      default: 100,
    },

    condition: {
      type: String,
      required: true,
    },

    value: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Achievement", achievementSchema);