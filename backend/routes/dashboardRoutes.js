const express = require("express");
const {
  getStats,
  getChartData,
  getRecentSubmissions,
  getRecentBattles,
  getActivityTimeline,
} = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/stats", getStats);
router.get("/charts", getChartData);
router.get("/recent-submissions", getRecentSubmissions);
router.get("/recent-battles", getRecentBattles);
router.get("/activity", getActivityTimeline);

module.exports = router;
