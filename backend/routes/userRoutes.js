const express = require("express");

const {
  getUserProfile,
  updateProfile,
  listUsers,
  uploadAvatar,
  getLeaderboard,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", listUsers);
router.get("/leaderboard", getLeaderboard);

router.put("/me", protect, updateProfile);
router.post("/me/avatar", protect, upload.single("avatar"), uploadAvatar);

router.get("/:username", getUserProfile);

module.exports = router;