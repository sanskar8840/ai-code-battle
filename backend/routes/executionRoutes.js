const express = require("express");
const { runCode, submitCode } = require("../controllers/executionController");
const { protect } = require("../middleware/authMiddleware");
const { executionLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

router.use(protect, executionLimiter);

router.post("/run", runCode);
router.post("/submit", submitCode);

module.exports = router;
