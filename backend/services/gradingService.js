/**
 * Priority order used when picking the single overall status for a submission
 * that ran multiple test cases. A compilation error is the same across every
 * test case (the code only compiles once conceptually), so it always wins.
 * After that we surface the first meaningfully "worse" failure a student
 * would want to see first.
 */
const STATUS_PRIORITY = [
  "Compilation Error",
  "Internal Error",
  "Exec Format Error",
  "Runtime Error",
  "Time Limit Exceeded",
  "Memory Limit Exceeded",
  "Wrong Answer",
];

/**
 * `results` = array of { status, runtimeMs, memoryKb, ... } from judge0Service.runTestCases.
 * Returns { overallStatus, passed, total, maxRuntimeMs, maxMemoryKb, score }.
 */
const aggregateResults = (results) => {
  const total = results.length;
  const passed = results.filter((r) => r.status === "Accepted").length;

  let overallStatus = "Accepted";
  for (const priorityStatus of STATUS_PRIORITY) {
    const firstMatch = results.find((r) => r.status === priorityStatus);
    if (firstMatch) {
      overallStatus = priorityStatus;
      break;
    }
  }

  const runtimes = results.map((r) => r.runtimeMs).filter((v) => v != null);
  const memories = results.map((r) => r.memoryKb).filter((v) => v != null);

  return {
    overallStatus,
    passed,
    total,
    maxRuntimeMs: runtimes.length ? Math.max(...runtimes) : null,
    maxMemoryKb: memories.length ? Math.max(...memories) : null,
    score: total === 0 ? 0 : Math.round((passed / total) * 1000) / 10,
  };
};

module.exports = { aggregateResults, STATUS_PRIORITY };
