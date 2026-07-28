import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import toast from "react-hot-toast";
import { FiArrowLeft } from "react-icons/fi";
import submissionService from "../../services/submissionService";
import languageService from "../../services/languageService";
import ExecutionStatusBadge from "../../components/editor/ExecutionStatusBadge";
import DifficultyBadge from "../../components/problems/DifficultyBadge";
import Spinner from "../../components/common/Spinner";
import { useTheme } from "../../context/ThemeContext";

const SubmissionDetail = () => {
  const { id } = useParams();
  const { theme } = useTheme();
  const [submission, setSubmission] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([submissionService.getSubmissionById(id), languageService.getLanguages()])
      .then(([sub, langs]) => {
        if (!cancelled) {
          setSubmission(sub);
          setLanguages(langs);
        }
      })
      .catch((err) => toast.error(err.message || "Couldn't load submission"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!submission) return null;

  const monacoLang = languages.find((l) => l.id === submission.language)?.monacoLanguage || "plaintext";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Link to="/submissions" className="flex items-center gap-1.5 font-body text-sm text-ink-800/60 hover:text-duel-500 dark:text-paper-100/60">
        <FiArrowLeft size={14} /> Back to submissions
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to={`/problems/${submission.problem}`} className="font-display text-xl font-bold hover:text-duel-500">
            {submission.problemTitle}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={submission.difficulty} />
            <ExecutionStatusBadge status={submission.status} />
            <span className="font-mono text-xs text-ink-800/50 dark:text-paper-100/50">
              {submission.testCasesPassed}/{submission.testCasesTotal} passed
            </span>
          </div>
        </div>

        <div className="text-right font-mono text-xs text-ink-800/50 dark:text-paper-100/50">
          {submission.runtimeMs != null && <p>{submission.runtimeMs} ms</p>}
          {submission.memoryKb != null && <p>{Math.round(submission.memoryKb / 1024)} MB</p>}
          <p className="mt-1">{new Date(submission.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="border-b border-ink-600/10 px-4 py-2 font-mono text-xs text-ink-800/50 dark:border-paper-200/10 dark:text-paper-100/50">
          {submission.language}
        </div>
        <div className="h-[500px]">
          <Editor
            language={monacoLang}
            value={submission.code}
            theme={theme === "dark" ? "vs-dark" : "light"}
            options={{
              readOnly: true,
              fontSize: 14,
              minimap: { enabled: false },
              fontFamily: "'JetBrains Mono', monospace",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16 },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetail;
