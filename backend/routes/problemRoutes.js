const express = require("express");
const { body } = require("express-validator");
const {
  getProblems,
  getProblem,
  createProblem,
  updateProblem,
  deleteProblem,
  getFilterMeta,
  getStarterCode,
} = require("../controllers/problemController");
const { protect, authorize, optionalAuth } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");

const router = express.Router();

const problemValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("difficulty").isIn(["Easy", "Medium", "Hard"]).withMessage("Difficulty must be Easy, Medium, or Hard"),
  body("examples").isArray({ min: 1 }).withMessage("At least one example is required"),
];

router.get("/meta/filters", optionalAuth, getFilterMeta);
router.get("/", optionalAuth, getProblems);
router.get("/:idOrSlug/starter-code", optionalAuth, getStarterCode);
router.get("/:idOrSlug", optionalAuth, getProblem);

router.post("/", protect, authorize("admin"), problemValidation, validate, createProblem);
router.put("/:id", protect, authorize("admin"), updateProblem);
router.delete("/:id", protect, authorize("admin"), deleteProblem);

module.exports = router;
