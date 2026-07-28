const asyncHandler = require("express-async-handler");
const openai = require("../services/aiService");

const explainWrongAnswer = asyncHandler(async (req, res) => {
  const {
    problemTitle,
    problemDescription,
    userCode,
    language,
  } = req.body;

  const completion = await openai.chat.completions.create({
    model: "cohere/north-mini-code:free",

    messages: [
      {
        role: "system",
        content: `
You are an expert DSA mentor.

The user's solution is incorrect.

Explain:
- Why it is wrong
- Which logic is probably incorrect
- What edge case they forgot
- Never provide corrected code
- Never provide the full solution
- Maximum 150 words.
`
      },

      {
        role: "user",
        content: `
Problem:
${problemTitle}

Description:
${problemDescription}

Language:
${language}

Code:
${userCode}
`
      }
    ]
  });

  res.json({
    success: true,
    explanation: completion.choices[0].message.content
  });
});

module.exports = { explainWrongAnswer };