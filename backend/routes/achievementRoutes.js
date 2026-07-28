const { protect } = require("../middleware/authMiddleware");const express = require("express");

const router = express.Router();

const {
  getAchievements,
} = require("../controllers/achievementController");

router.get("/", protect, getAchievements);

module.exports = router;
