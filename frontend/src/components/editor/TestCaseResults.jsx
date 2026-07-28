import { useState } from "react";
import ExecutionStatusBadge from "./ExecutionStatusBadge";

/**
 * `results` = [{ testCaseNumber, input, expectedOutput, actualOutput, status,
 *   stderr?, compileOutput?, runtimeMs, memoryKb }]
 * Used for both "Run" (visible-only) and the visible portion of "Submit" results.
 */
const TestCaseResults = ({ results = [], hiddenSummary }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (results.length === 0) return null;

  const active = results[activeTab];

  return (
    <div className="card mt-4 overflow-hidden">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-ink-600/10 px-3 py-2 dark:border-paper-200/10">
        {results.map((r, i) => (
          <button
            key={r.testCaseNumber}
            type="button"
            onClick={() => setActiveTab(i)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs transition-colors ${
              activeTab === i
                ? "bg-duel-500/10 text-duel-500"
                : "text-ink-800/60 hover:bg-ink-900/5 dark:text-paper-100/60 dark:hover:bg-paper-100/10"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${r.status === "Accepted" ? "bg-pass" : "bg-fail"}`}
            />
            Case {r.testCaseNumber}
          </button>
        ))}
      </div>

      <div className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <ExecutionStatusBadge status={active.status} />
          <div className="flex gap-3 font-mono text-xs text-ink-800/50 dark:text-paper-100/50">
            {active.runtimeMs != null && <span>{active.runtimeMs} ms</span>}
            {active.memoryKb != null && <span>{Math.round(active.memoryKb / 1024)} MB</span>}
          </div>
        </div>

        <div className="mt-4 space-y-3 font-mono text-xs">
          <div>
            <p className="mb-1 text-ink-800/50 dark:text-paper-100/50">Input</p>
            <pre className="whitespace-pre-wrap rounded-md bg-ink-900/[0.03] p-3 dark:bg-paper-100/[0.03]">{active.input}</pre>
          </div>
          <div>
            <p className="mb-1 text-ink-800/50 dark:text-paper-100/50">Expected output</p>
            <pre className="whitespace-pre-wrap rounded-md bg-ink-900/[0.03] p-3 dark:bg-paper-100/[0.03]">{active.expectedOutput}</pre>
          </div>
          <div>
            <p className="mb-1 text-ink-800/50 dark:text-paper-100/50">Your output</p>
            <pre
              className={`whitespace-pre-wrap rounded-md p-3 ${
                active.status === "Accepted" ? "bg-pass/5 text-pass" : "bg-fail/5 text-fail"
              }`}
            >
              {active.actualOutput || "(no output)"}
            </pre>
          </div>
          {active.compileOutput && (
            <div>
              <p className="mb-1 text-ink-800/50 dark:text-paper-100/50">Compiler output</p>
              <pre className="whitespace-pre-wrap rounded-md bg-fail/5 p-3 text-fail">{active.compileOutput}</pre>
            </div>
          )}
          {active.stderr && (
            <div>
              <p className="mb-1 text-ink-800/50 dark:text-paper-100/50">stderr</p>
              <pre className="whitespace-pre-wrap rounded-md bg-fail/5 p-3 text-fail">{active.stderr}</pre>
            </div>
          )}
        </div>

        {hiddenSummary && hiddenSummary.total > 0 && (
          <div className="mt-4 rounded-md border border-ink-600/10 p-3 font-body text-xs text-ink-800/60 dark:border-paper-200/10 dark:text-paper-100/60">
            Hidden test cases: <span className="font-semibold">{hiddenSummary.passed}/{hiddenSummary.total}</span> passed
            (inputs and expected outputs stay hidden — that's what keeps grading honest).
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCaseResults;
