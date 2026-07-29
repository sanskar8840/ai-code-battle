import axios from "axios";
import { useEffect, useState } from "react";


import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiEdit2, FiTrash2, FiCode, FiBriefcase, FiTag } from "react-icons/fi";
import problemService from "../../services/problemService";
import languageService from "../../services/languageService";
import DifficultyBadge from "../../components/problems/DifficultyBadge";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import { ProblemDetailSkeleton } from "../../components/common/Skeleton";
import CodeEditor from "../../components/editor/CodeEditor";
import ExecutionPanel from "../../components/editor/ExecutionPanel";
const API = import.meta.env.VITE_API_URL;

const ProblemDetail = () => {
  const { slug } = useParams();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [editorState, setEditorState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hint, setHint] = useState("");
const [loadingHint, setLoadingHint] = useState(false);
const [complexity, setComplexity] = useState("");
const [loadingComplexity, setLoadingComplexity] = useState(false);
const [dryRun, setDryRun] = useState("");
const [loadingDryRun, setLoadingDryRun] = useState(false);
const [testCases, setTestCases] = useState("");
const [loadingTestCases, setLoadingTestCases] = useState(false);
const [bugs, setBugs] = useState("");
const [loadingBugs, setLoadingBugs] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    Promise.all([problemService.getProblem(slug), languageService.getLanguages()])
      .then(([problemData, languagesData]) => {
        if (!cancelled) {
          setProblem(problemData);
          setLanguages(languagesData);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (err.status === 404) setNotFound(true);
          else toast.error(err.message || "Couldn't load this problem");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${problem.title}"? This can't be undone.`)) return;
    setDeleting(true);
    try {
      await problemService.deleteProblem(problem._id);
      toast.success("Problem deleted");
      navigate("/problems");
    } catch (err) {
      toast.error(err.message || "Delete failed");
      setDeleting(false);
    }
  };
  const getHint = async () => {
  try {
    setLoadingHint(true);

    const res = await axios.post(`${API}/ai/hint`, {
      problemTitle: problem.title,
      problemDescription: problem.description,
    });

    setHint(res.data.hint);
  } catch (err) {
    toast.error("Failed to get AI Hint");
  } finally {
    setLoadingHint(false);
  }
};



const generateTestCases = async () => {
  try {
    setLoadingTestCases(true);

    const res =await axios.post(`${API}/ai/testcases`,
      {
        problemTitle: problem.title,
        problemDescription: problem.description,
        language: editorState?.language,
        userCode: editorState?.code,
      }
    );

    setTestCases(res.data.testCases);
  } catch (err) {
    toast.error("Failed to generate test cases");
  } finally {
    setLoadingTestCases(false);
  }
};



const findBugs = async () => {
  try {
    setLoadingBugs(true);

    const res = await axios.post(`${API}/ai/bugfinder`,
      {
        problemTitle: problem.title,
        problemDescription: problem.description,
        language: editorState?.language,
        userCode: editorState?.code,
      }
    );

    setBugs(res.data.bugs);
  } catch (err) {
    toast.error("Failed to find bugs");
  } finally {
    setLoadingBugs(false);
  }
};




const getDryRun = async () => {
  try {
    setLoadingDryRun(true);

    const res = await axios.post(`${API}/ai/dryrun`,
      {
        problemTitle: problem.title,
        problemDescription: problem.description,
        language: editorState?.language,
        userCode: editorState?.code,
      }
    );

    setDryRun(res.data.dryRun);
  } catch (err) {
    toast.error("Failed to generate AI Dry Run");
  } finally {
    setLoadingDryRun(false);
  }
};



const analyzeComplexity = async () => {
  try {
    setLoadingComplexity(true);

    const res = await axios.post(`${API}/ai/complexity`,
      {
        language: editorState?.language,
        userCode: editorState?.code,
      }
    );

    setComplexity(res.data.analysis);
  } catch (err) {
    toast.error("Failed to analyze complexity");
  } finally {
    setLoadingComplexity(false);
  }
};

  if (loading) return <ProblemDetailSkeleton />;

  if (notFound || !problem) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          icon={FiCode}
          title="Problem not found"
          description="It may have been unpublished or removed."
          action={
            <Link to="/problems" className="btn-primary">
              Back to problems
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold">{problem.title}</h1>
            {!problem.isPublished && (
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 font-body text-xs font-medium text-amber-600">
                Draft
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={problem.difficulty} />
            <span className="font-mono text-xs text-ink-800/50 dark:text-paper-100/50">
              {problem.acceptanceRate?.toFixed(1) ?? "0.0"}% acceptance
            </span>
          </div>
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <Link to={`/admin/problems/${problem._id}/edit`} className="btn-secondary">
              <FiEdit2 size={14} /> Edit
            </Link>
            <Button variant="secondary" onClick={handleDelete} isLoading={deleting} className="border-fail/30 text-fail hover:bg-fail/5">
              <FiTrash2 size={14} /> Delete
            </Button>
          </div>
        )}
      </div>

      {(problem.tags?.length > 0 || problem.companies?.length > 0) && (
        <div className="mt-4 space-y-2">
          {problem.tags?.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <FiTag className="text-ink-800/40 dark:text-paper-100/40" size={14} />
              {problem.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-ink-600/5 px-2.5 py-0.5 font-mono text-xs text-ink-800/60 dark:bg-paper-200/5 dark:text-paper-100/60">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {problem.companies?.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <FiBriefcase className="text-ink-800/40 dark:text-paper-100/40" size={14} />
              {problem.companies.map((c) => (
                <span key={c} className="rounded-full bg-duel-500/5 px-2.5 py-0.5 font-body text-xs text-duel-500">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Split layout: description left, editor right (LeetCode-style) */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <div className="card max-h-[75vh] overflow-y-auto p-6 sm:p-8 lg:sticky lg:top-20">
          <div className="whitespace-pre-wrap font-body text-sm leading-relaxed text-ink-800/90 dark:text-paper-100/90">
            {problem.description}
          </div>

          {problem.constraints?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-display text-sm font-semibold">Constraints</h3>
              <ul className="mt-2 list-inside list-disc space-y-1 font-mono text-xs text-ink-800/70 dark:text-paper-100/70">
                {problem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {problem.examples?.map((ex, i) => (
              <div key={i} className="rounded-lg bg-ink-900/[0.03] p-4 font-mono text-xs dark:bg-paper-100/[0.03]">
                <p className="font-body text-sm font-semibold not-italic">Example {i + 1}</p>
                <p className="mt-2">
                  <span className="text-ink-800/50 dark:text-paper-100/50">Input: </span>
                  {ex.input}
                </p>
                <p className="mt-1">
                  <span className="text-ink-800/50 dark:text-paper-100/50">Output: </span>
                  {ex.output}
                </p>
                {ex.explanation && (
                  <p className="mt-1">
                    <span className="text-ink-800/50 dark:text-paper-100/50">Explanation: </span>
                    {ex.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          {languages.length > 0 && problem.supportedLanguages?.length > 0 ? (
            <CodeEditor problem={problem} languages={languages} onStateChange={setEditorState} />
          ) : (
            <div className="card p-8 text-center">
              <FiCode className="mx-auto text-ink-800/30 dark:text-paper-100/30" size={22} />
              <p className="mt-2 font-body text-sm text-ink-800/60 dark:text-paper-100/60">
                No supported languages configured for this problem yet.
              </p>
            </div>
          )}

          <div className="mt-4">
            <div className="card p-4 mb-4">
  <div className="flex gap-3">
 <div className="flex gap-3">
  <button
    onClick={getHint}
    disabled={loadingHint}
    className="btn-primary"
  >
    {loadingHint ? "Generating Hint..." : "💡 AI Hint"}
  </button>

  <button
    onClick={getDryRun}
    disabled={loadingDryRun}
    className="btn-secondary"
  >
    {loadingDryRun ? "Generating..." : "▶️ AI Dry Run"}
  </button>


  <button
  onClick={findBugs}
  disabled={loadingBugs}
  className="btn-secondary"
>
  {loadingBugs
    ? "Finding..."
    : "🐞 AI Bug Finder"}
</button>




</div>

  <button
    onClick={analyzeComplexity}
    disabled={loadingComplexity}
    className="btn-secondary"
  >
    {loadingComplexity
      ? "Analyzing..."
      : "⏱ AI Complexity"}
  </button>
  <button
  onClick={generateTestCases}
  disabled={loadingTestCases}
  className="btn-secondary"
>
  {loadingTestCases
    ? "Generating..."
    : "🧪 AI Test Cases"}
</button>
</div>

  {hint && (
    <div className="mt-4 rounded-lg bg-gray-100 dark:bg-gray-800 p-3">
      <h3 className="font-bold mb-2">AI Hint</h3>
      <p>{hint}</p>
    </div>
  )}


  {dryRun && (
  <div className="mt-4 rounded-lg bg-gray-100 dark:bg-gray-800 p-3">
    <h3 className="font-bold mb-2">
      ▶️ AI Dry Run
    </h3>

    <pre className="whitespace-pre-wrap">
      {dryRun}
    </pre>
  </div>
)}


  {complexity && (
  <div className="mt-4 rounded-lg bg-gray-100 dark:bg-gray-800 p-3">
    <h3 className="font-bold mb-2">
      ⏱ AI Complexity Analysis
    </h3>

    <pre className="whitespace-pre-wrap">
      {complexity}
    </pre>
  </div>
)}


{testCases && (
  <div className="mt-4 rounded-lg bg-gray-100 dark:bg-gray-800 p-3">
    <h3 className="font-bold mb-2">
      🧪 AI Generated Test Cases
    </h3>

    <pre className="whitespace-pre-wrap">
      {testCases}
    </pre>
  </div>
)}

{bugs && (
  <div className="mt-4 rounded-lg bg-gray-100 dark:bg-gray-800 p-3">
    <h3 className="font-bold mb-2">
      🐞 AI Bug Report
    </h3>

    <pre className="whitespace-pre-wrap">
      {bugs}
    </pre>
  </div>
)}




</div>
            {isAuthenticated ? (
              <ExecutionPanel problem={problem} editorState={editorState} />
            ) : (
              <div className="card p-4 text-center">
                <p className="font-body text-sm text-ink-800/60 dark:text-paper-100/60">
                  <Link to="/login" className="font-medium text-duel-500 hover:underline">Log in</Link> to run and submit your code.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
