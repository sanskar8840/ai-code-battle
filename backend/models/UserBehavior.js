const mongoose = require("mongoose");

const behaviorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },

    difficulty: String,

    tags: [String],

    language: String,

    accepted: Boolean,

    executionTime: Number,

    memory: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserBehavior", behaviorSchema);