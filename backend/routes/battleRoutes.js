const express = require("express");
const { getMyBattles, getBattleByRoom } = require("../controllers/battleController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getMyBattles);
router.get("/:roomId", getBattleByRoom);

module.exports = router;
