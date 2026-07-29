import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiPlay, FiSend, FiExternalLink } from "react-icons/fi";
import Button from "../common/Button";
import ExecutionStatusBadge from "./ExecutionStatusBadge";
import TestCaseResults from "./TestCaseResults";
import executionService from "../../services/executionService";
import AchievementPopup from "../achievements/AchievementPopup";
import axios from "axios";
/**
 * `editorState` = { language, code } — the latest value from CodeEditor's onStateChange.
 * Kept separate from CodeEditor itself so this same panel can be reused for
 * battle mode in Phase 9 without coupling the editor to problem-solving UI.
 */
const ExecutionPanel = ({ problem, editorState }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [aiExplanation, setAiExplanation] = useState("");
const [loadingExplanation, setLoadingExplanation] = useState(false);
const [optimization, setOptimization] = useState("");
const [loadingOptimization, setLoadingOptimization] = useState(false);

  const canExecute = editorState?.code?.trim().length > 0;

  const handleRun = async () => {
     console.log("RUN BUTTON CLICKED");
    if (!canExecute) {
      toast.error("Write some code first");
      return;
    }

    setIsRunning(true);
    setSubmitResult(null);

    try {
      const result = await executionService.runCode({
        problemId: problem._id,
        language: editorState.language,
        code: editorState.code,
      });

      setRunResult(result);

      if (result.status === "Accepted") {
        toast.success(
          `All ${result.total} visible test case${
            result.total === 1 ? "" : "s"
          } passed`
        );
      } else {
        toast.error(result.status);
      }
    } catch (err) {
      toast.error(err.message || "Run failed");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!canExecute) {
      toast.error("Write some code first");
      return;
    }

    setIsSubmitting(true);
    setRunResult(null);

    try {
      const result = await executionService.submitCode({
        problemId: problem._id,
        language: editorState.language,
        code: editorState.code,
      });

      setSubmitResult(result);

      if (result.status === "Accepted") {
        toast.success(
          result.newlySolved
            ? "Accepted — first time solving this one!"
            : "Accepted"
        );

        if (result.unlockedAchievements?.length > 0) {
          setTimeout(() => {
            result.unlockedAchievements.forEach((achievement) => {
              toast.success(
                `${achievement.icon} Achievement Unlocked!\n${achievement.title}`,
                {
                  duration: 5000,
                }
              );
            });
          }, 500);
        }
      } else {
        toast.error(
          `${result.status} — ${result.passed}/${result.total} test cases passed`
        );
      }
    } catch (err) {
      toast.error(err.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };



  const explainWrongAnswer = async () => {
  try {
    setLoadingExplanation(true);

    const res = await axios.post(
      "http://localhost:5000/api/ai/explain",
      {
        problemTitle: problem.title,
        problemDescription: problem.description,
        language: editorState.language,
        userCode: editorState.code,
      }
    );

    setAiExplanation(res.data.explanation);
  } catch (err) {
    toast.error("AI explanation failed");
  } finally {
    setLoadingExplanation(false);
  }
};



const optimizeCode = async () => {
  try {
    setLoadingOptimization(true);

    const res = await axios.post(
      "http://localhost:5000/api/ai/optimize",
      {
        problemTitle: problem.title,
        problemDescription: problem.description,
        language: editorState.language,
        userCode: editorState.code,
      }
    );

    setOptimization(res.data.optimization);
  } catch (err) {
    toast.error("AI Optimization failed");
  } finally {
    setLoadingOptimization(false);
  }
};







  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          onClick={handleRun}
          isLoading={isRunning}
          disabled={isSubmitting}
        >
          <FiPlay size={14} /> Run
        </Button>

        <Button
          onClick={handleSubmit}
          isLoading={isSubmitting}
          disabled={isRunning}
        >
          <FiSend size={14} /> Submit
        </Button>

        {(isRunning || isSubmitting) && (
          <span className="font-body text-xs text-ink-800/50 dark:text-paper-100/50">
            Sending to Judge0 and waiting for results — this can take a few
            seconds…
          </span>
        )}
      </div>

      {runResult && !isRunning && (
        <TestCaseResults results={runResult.results} />
      )}

      {submitResult && !isSubmitting && (
        <div className="card mt-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ExecutionStatusBadge
                status={submitResult.status}
                size="lg"
              />
              <span className="font-mono text-sm text-ink-800/60 dark:text-paper-100/60">
                {submitResult.passed}/{submitResult.total} test cases passed
              </span>
            </div>

            <Link
              to={`/submissions/${submitResult.submissionId}`}
              className="flex items-center gap-1 font-body text-xs font-medium text-duel-500 hover:underline"
            >
              View full submission <FiExternalLink size={12} />
            </Link>
          </div>

          <div className="mt-3 flex gap-4 font-mono text-xs text-ink-800/50 dark:text-paper-100/50">
            {submitResult.runtimeMs != null && (
              <span>Runtime: {submitResult.runtimeMs} ms</span>
            )}

            {submitResult.memoryKb != null && (
              <span>
                Memory: {Math.round(submitResult.memoryKb / 1024)} MB
              </span>
            )}
          </div>
          {submitResult.visibleResults?.length > 0 && (
  <>
    <TestCaseResults
      results={submitResult.visibleResults}
      hiddenSummary={submitResult.hiddenSummary}
    />

    {submitResult.status !== "Accepted" && (
      <div className="mt-4">
        <Button
          variant="secondary"
          onClick={explainWrongAnswer}
          isLoading={loadingExplanation}
        >
          🤖 Explain Wrong Answer
        </Button>

       {aiExplanation && (
  <div className="mt-3 rounded-lg bg-gray-100 dark:bg-gray-800 p-4">
    <h3 className="font-bold mb-2">
      AI Explanation
    </h3>

    <p>{aiExplanation}</p>

    <div className="mt-3">
      <Button
        variant="secondary"
        onClick={optimizeCode}
        isLoading={loadingOptimization}
      >
        🚀 Optimize Code
      </Button>
    </div>

    {optimization && (
      <div className="mt-4 rounded-lg border p-4 bg-white dark:bg-gray-900">
        <h3 className="font-bold mb-2">
          🚀 Optimized Code
        </h3>

        <pre className="whitespace-pre-wrap overflow-x-auto text-sm">
          {optimization}
        </pre>
      </div>
    )}
  </div>
)}


        
      </div>
    )}
  </>
)}

          
        </div>
      )}

      <AchievementPopup
        achievements={submitResult?.unlockedAchievements || []}
      />
    </div>
  );
};

export default ExecutionPanel;