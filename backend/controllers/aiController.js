const asyncHandler = require("express-async-handler");
const openai = require("../services/aiService");

// ---------------- AI Hint ----------------
const getHint = asyncHandler(async (req, res) => {
  const { problemTitle, problemDescription } = req.body;

  const completion = await openai.chat.completions.create({
    model: "cohere/north-mini-code:free",
    messages: [
      {
        role: "system",
        content:
          "You are a DSA mentor. Give only a hint. Never provide the full solution.",
      },
      {
        role: "user",
        content: `Problem: ${problemTitle}

Description:
${problemDescription}`,
      },
    ],
  });

  res.json({
    success: true,
    hint: completion.choices[0].message.content,
  });
});

// ---------------- Explain Wrong Answer ----------------
const explainWrongAnswer = asyncHandler(async (req, res) => {
  const {
    problemTitle,
    problemDescription,
    language,
    userCode,
  } = req.body;

  const completion = await openai.chat.completions.create({
    model: "cohere/north-mini-code:free",
    messages: [
      {
        role: "system",
        content:
          "You are an expert DSA mentor. Explain why the user's solution is wrong. Don't provide the complete solution.",
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
`,
      },
    ],
  });

  res.json({
    success: true,
    explanation: completion.choices[0].message.content,
  });
});

// ---------------- Optimize Code ----------------
const optimizeCode = asyncHandler(async (req, res) => {
  const {
    problemTitle,
    problemDescription,
    language,
    userCode,
  } = req.body;

  const completion = await openai.chat.completions.create({
    model: "cohere/north-mini-code:free",
    messages: [
      {
        role: "system",
        content:
          "You are an expert competitive programmer. Optimize the user's code. Explain the improvements and provide the optimized code.",
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
`,
      },
    ],
  });

  res.json({
    success: true,
    optimization: completion.choices[0].message.content,
  });
});


const analyzeComplexity = asyncHandler(async (req, res) => {
  const { language, userCode } = req.body;

  const completion = await openai.chat.completions.create({
    model: "cohere/north-mini-code:free",
    messages: [
      {
        role: "system",
        content:
          "You are an expert DSA mentor. Analyze only the time complexity and space complexity of the code. Keep the answer short."
      },
      {
        role: "user",
        content: `Language: ${language}

Code:
${userCode}`
      }
    ]
  });

  res.json({
    success: true,
    analysis: completion.choices[0].message.content
  });
});

// ---------------- AI Dry Run ----------------
const dryRunCode = asyncHandler(async (req, res) => {
  const {
    problemTitle,
    problemDescription,
    language,
    userCode,
  } = req.body;

  const completion = await openai.chat.completions.create({
    model: "cohere/north-mini-code:free",
    messages: [
      {
        role: "system",
        content:
          "You are an expert DSA mentor. Dry run the given code on a simple example. Explain every iteration step-by-step. Do not modify the code."
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
    dryRun: completion.choices[0].message.content,
  });
});



// ---------------- AI Bug Finder ----------------
const bugFinder = asyncHandler(async (req, res) => {
  const {
    problemTitle,
    problemDescription,
    language,
    userCode,
  } = req.body;

  const completion = await openai.chat.completions.create({
    model: "cohere/north-mini-code:free",
    messages: [
      {
        role: "system",
        content:
          "You are an expert competitive programmer. Find logical bugs in the user's code. Mention the exact issue, where it occurs, and how to fix it. Do NOT rewrite the complete solution."
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
    bugs: completion.choices[0].message.content,
  });
});




// ---------------- AI Test Case Generator ----------------
const generateTestCases = asyncHandler(async (req, res) => {
  const {
    problemTitle,
    problemDescription,
    language,
    userCode,
  } = req.body;

  const completion = await openai.chat.completions.create({
    model: "cohere/north-mini-code:free",
    messages: [
      {
        role: "system",
        content:
          "You are an expert competitive programmer. Generate high-quality test cases for the given coding problem. Include normal cases, edge cases, corner cases, large inputs, duplicate values, negative values (if applicable), and explain why each test case is useful."
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

User Code:
${userCode}
`
      }
    ]
  });

  res.json({
    success: true,
    testCases: completion.choices[0].message.content,
  });
});



module.exports = {
  getHint,
  explainWrongAnswer,
  optimizeCode,
  analyzeComplexity,
  dryRunCode,
  generateTestCases,
  bugFinder,
};
