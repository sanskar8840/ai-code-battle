const express = require("express");
const router = express.Router();

const {
  getHint,
  explainWrongAnswer,
  optimizeCode,
  analyzeComplexity,
  dryRunCode,
  generateTestCases,
  bugFinder,
} = require("../controllers/aiController");

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Route Working",
  });
});

router.post("/hint", getHint);
router.post("/explain", explainWrongAnswer);
router.post("/optimize", optimizeCode);
router.post("/complexity", analyzeComplexity);
 router.post("/dryrun", dryRunCode);
 router.post("/testcases", generateTestCases);
 router.post("/bugfinder", bugFinder);

module.exports = router;