const axios = require("axios");
const he = require("he");
const config = require("../config/config");
const { getLanguageById } = require("../config/languages");

const headers = {
  "Content-Type": "application/json",
};

if (config.judge0.apiKey) {
  headers["X-RapidAPI-Key"] = config.judge0.apiKey;
}

if (config.judge0.apiHost) {
  headers["X-RapidAPI-Host"] = config.judge0.apiHost;
}

const judge0Client = axios.create({
  baseURL: config.judge0.apiUrl,
  timeout: 15000,
  headers,
});

/**
 * Judge0's full status table (CE). We map every one of these into our own
 * Submission.status enum. Memory Limit Exceeded has no dedicated Judge0
 * status ID in the CE edition, so it's inferred afterwards by comparing
 * reported memory against the problem's configured limit — see
 * `applyMemoryLimitOverride` below.
 */
const STATUS_MAP = {
  1: "Processing", // In Queue
  2: "Processing", // Processing
  3: "Accepted",
  4: "Wrong Answer",
  5: "Time Limit Exceeded",
  6: "Compilation Error",
  7: "Runtime Error", // SIGSEGV
  8: "Runtime Error", // SIGXFSZ
  9: "Runtime Error", // SIGFPE
  10: "Runtime Error", // SIGABRT
  11: "Runtime Error", // NZEC
  12: "Runtime Error", // Other
  13: "Internal Error",
  14: "Exec Format Error",
};

const IN_PROGRESS_IDS = new Set([1, 2]);

const toBase64 = (str = "") => Buffer.from(str, "utf-8").toString("base64");
const fromBase64 = (str) => (str ? Buffer.from(str, "base64").toString("utf-8") : "");

/**
 * If Judge0 reports more memory used than the problem allows, we override
 * whatever status it gave us — a program that technically finished but blew
 * past the memory budget should read as MLE to the student, not Accepted/RE.
 */
const applyMemoryLimitOverride = (mappedStatus, memoryKb, memoryLimitKb) => {
  if (memoryLimitKb && memoryKb && memoryKb > memoryLimitKb) {
    return "Memory Limit Exceeded";
  }
  return mappedStatus;
};

const mapResult = (raw, memoryLimitKb) => {
  const mappedStatus = STATUS_MAP[raw.status?.id] || "Runtime Error";
  const memoryKb = raw.memory ?? null;

  return {
    status: applyMemoryLimitOverride(mappedStatus, memoryKb, memoryLimitKb),
    judge0StatusId: raw.status?.id,
    judge0StatusDescription: raw.status?.description,
    stdout: fromBase64(raw.stdout),
    stderr: fromBase64(raw.stderr),
    compileOutput: fromBase64(raw.compile_output),
    message: fromBase64(raw.message),
    runtimeMs: raw.time ? Math.round(parseFloat(raw.time) * 1000) : null,
    memoryKb,
  };
};

/**
 * Thin retry wrapper for transient network failures / Judge0 5xx responses.
 * Does NOT retry on 4xx (bad request, auth failure) since retrying won't help.
 */
const withRetry = async (fn, { retries = 3, delayMs = 500 } = {}) => {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await fn();
    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      const isClientError = status >= 400 && status < 500;
      if (isClientError || attempt === retries) break;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, delayMs * 2 ** attempt));
    }
  }
  throw lastError;
};

/**
 * Submits a batch of test cases for one piece of source code and returns
 * Judge0 tokens to poll. `testCases` = [{ input, expectedOutput }].
 */
const submitBatch = async ({ languageId, sourceCode, testCases, cpuTimeLimitSec, memoryLimitKb }) => {
  sourceCode = he.decode(sourceCode);
  console.log("Original Source Code:");
console.log(sourceCode);
  const submissions = testCases.map((tc) => ({
    language_id: languageId,
    source_code: toBase64(sourceCode),
    stdin: toBase64(tc.input || ""),
    expected_output: toBase64(tc.expectedOutput || ""),
    cpu_time_limit: cpuTimeLimitSec,
    memory_limit: memoryLimitKb,
  }));


  console.log("Sending to Judge0:");
console.log(JSON.stringify(submissions, null, 2));

  const response = await withRetry(() =>
    judge0Client.post("/submissions/batch?base64_encoded=true", { submissions })
  );

  return response.data.map((s) => s.token);
};

/**
 * Polls a batch of tokens until every submission has left the queue/processing
 * state, with exponential-ish backoff between polls and a hard timeout so a
 * stuck Judge0 instance can never hang a request forever.
 */
const pollBatch = async (tokens, { intervalMs = 1000, maxAttempts = 20 } = {}) => {
  const fields = "token,status,stdout,stderr,compile_output,message,time,memory";
  const tokenParam = tokens.join(",");

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    const response = await withRetry(() =>
      judge0Client.get(`/submissions/batch?tokens=${tokenParam}&base64_encoded=true&fields=${fields}`)
    );

    const results = response.data.submissions;
    const stillRunning = results.some((r) => IN_PROGRESS_IDS.has(r.status?.id));

    if (!stillRunning) return results;

    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, Math.min(intervalMs * 1.3 ** attempt, 4000)));
  }

  throw new Error("Judge0 execution timed out — the judge took too long to respond.");
};

/**
 * High-level entry point: run one submission's source code against a list of
 * test cases and return normalized, graded results. Used by both "Run"
 * (visible examples only) and "Submit" (visible + hidden) flows.
 */
const runTestCases = async ({ language, sourceCode, testCases, timeLimitMs, memoryLimitKb }) => {
  const languageMeta = getLanguageById(language);
  if (!languageMeta) {
    throw new Error(`Unsupported language: ${language}`);
  }
  // if (!config.judge0.apiKey || config.judge0.apiKey === "your_rapidapi_key_here") {
  //   throw new Error(
  //     "Judge0 isn't configured yet — add JUDGE0_API_KEY (and JUDGE0_API_URL / JUDGE0_API_HOST) to backend/.env."
  //   );
  // }

  const cpuTimeLimitSec = Math.max(timeLimitMs / 1000, 1);

  const tokens = await submitBatch({
    languageId: languageMeta.judge0Id,
    sourceCode,
    testCases,
    cpuTimeLimitSec,
    memoryLimitKb,
  });

  const rawResults = await pollBatch(tokens);

  return rawResults.map((raw, i) => ({
    ...mapResult(raw, memoryLimitKb),
    input: testCases[i].input,
    expectedOutput: testCases[i].expectedOutput,
  }));
};

module.exports = {
  runTestCases,
  mapResult, // exported for unit testing
  STATUS_MAP,
  applyMemoryLimitOverride,
  toBase64,
  fromBase64,
};
