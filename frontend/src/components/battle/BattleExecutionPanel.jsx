import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiPlay, FiSend } from "react-icons/fi";
import Button from "../common/Button";
import TestCaseResults from "../editor/TestCaseResults";
import { useSocket } from "../../context/SocketContext";

/**
 * `editorState` = { language, code } from CodeEditor's onStateChange.
 * Unlike the solo ExecutionPanel, this never calls the REST /api/execute
 * endpoints — everything goes through the room's socket so the opponent's
 * live progress updates in real time.
 */
const BattleExecutionPanel = ({ roomId, editorState, disabled }) => {
  const { socket } = useSocket();
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);

  useEffect(() => {
    if (!socket) return undefined;

    const handleResult = (result) => {
      if (result.isRun) {
        setIsRunning(false);
        setRunResult(result);
        toast[result.status === "Accepted" ? "success" : "error"](
          result.status === "Accepted" ? "All visible test cases passed" : result.status
        );
      } else {
        setIsSubmitting(false);
        toast[result.status === "Accepted" ? "success" : "error"](
          result.status === "Accepted" ? "Accepted! 🎉" : `${result.status} — ${result.passed}/${result.total} passed`
        );
      }
    };

    const handleError = (err) => {
      setIsRunning(false);
      setIsSubmitting(false);
      toast.error(err.message || "Execution failed");
    };

    socket.on("submissionResult", handleResult);
    socket.on("battleError", handleError);
    return () => {
      socket.off("submissionResult", handleResult);
      socket.off("battleError", handleError);
    };
  }, [socket]);

  const canExecute = editorState?.code?.trim().length > 0 && !disabled;

  const handleRun = () => {
    if (!canExecute) {
      toast.error("Write some code first");
      return;
    }
    setIsRunning(true);
    socket.emit("codeRun", { roomId, language: editorState.language, code: editorState.code });
  };

  const handleSubmit = () => {
    if (!canExecute) {
      toast.error("Write some code first");
      return;
    }
    setIsSubmitting(true);
    setRunResult(null);
    socket.emit("codeSubmit", { roomId, language: editorState.language, code: editorState.code });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" onClick={handleRun} isLoading={isRunning} disabled={isSubmitting || disabled}>
          <FiPlay size={14} /> Run
        </Button>
        <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={isRunning || disabled}>
          <FiSend size={14} /> Submit
        </Button>
        {(isRunning || isSubmitting) && (
          <span className="font-body text-xs text-ink-800/50 dark:text-paper-100/50">Grading against Judge0…</span>
        )}
      </div>

      {runResult && !isRunning && <TestCaseResults results={runResult.results} />}
    </div>
  );
};

export default BattleExecutionPanel;
