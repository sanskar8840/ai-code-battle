const asyncHandler = require("express-async-handler");
const { LANGUAGES } = require("../config/languages");
const sendResponse = require("../utils/ApiResponse");

// @desc    List all supported languages with Monaco + editor metadata
// @route   GET /api/languages
// @access  Public
const getLanguages = asyncHandler(async (req, res) => {
  // judge0Id is intentionally omitted from the public payload — it's an
  // execution-engine implementation detail the frontend editor doesn't need
  // until Phase 8 wires up the actual submit-to-Judge0 flow.
  const publicLanguages = LANGUAGES.map(({ id, label, monacoLanguage, extension }) => ({
    id,
    label,
    monacoLanguage,
    extension,
  }));

  sendResponse(res, 200, "Languages fetched", { languages: publicLanguages });
});

module.exports = { getLanguages };
