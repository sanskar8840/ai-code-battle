const express = require("express");
const { getMySubmissions, getSubmissionById } = require("../controllers/submissionController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getMySubmissions);
router.get("/:id", getSubmissionById);

module.exports = router;
