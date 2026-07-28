import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiInbox } from "react-icons/fi";
import submissionService from "../../services/submissionService";
import ExecutionStatusBadge from "../../components/editor/ExecutionStatusBadge";
import Pagination from "../../components/common/Pagination";
import EmptyState from "../../components/common/EmptyState";
import { ProblemListSkeleton } from "../../components/common/Skeleton";

const STATUS_FILTERS = [
  "",
  "Accepted",
  "Wrong Answer",
  "Time Limit Exceeded",
  "Memory Limit Exceeded",
  "Compilation Error",
  "Runtime Error",
];

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const SubmissionHistory = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState({ submissions: [], pagination: { pages: 1, total: 0 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    submissionService
      .getMySubmissions({ page, limit: 20, status: status || undefined })
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((err) => toast.error(err.message || "Couldn't load submissions"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, status]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Submission history</h1>
          <p className="mt-1 font-body text-sm text-ink-800/60 dark:text-paper-100/60">
            {result.pagination.total} submission{result.pagination.total === 1 ? "" : "s"}
          </p>
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="input-field w-56"
        >
          <option value="">All statuses</option>
          {STATUS_FILTERS.slice(1).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {loading ? (
          <ProblemListSkeleton rows={8} />
        ) : result.submissions.length === 0 ? (
          <EmptyState
            icon={FiInbox}
            title="No submissions yet"
            description="Solve a problem and hit Submit — your attempts will show up here."
            action={
              <Link to="/problems" className="btn-primary">
                Browse problems
              </Link>
            }
          />
        ) : (
          <div className="card overflow-hidden">
            {result.submissions.map((s) => (
              <Link
                key={s._id}
                to={`/submissions/${s._id}`}
                className="flex items-center justify-between gap-4 border-b border-ink-600/10 px-4 py-4 transition-colors last:border-0 hover:bg-ink-900/[0.02] dark:border-paper-200/10 dark:hover:bg-paper-100/[0.03] sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body text-sm font-medium">{s.problemTitle}</p>
                  <p className="font-mono text-xs text-ink-800/50 dark:text-paper-100/50">
                    {s.language} · {formatDate(s.createdAt)}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs text-ink-800/50 dark:text-paper-100/50">
                  {s.testCasesPassed}/{s.testCasesTotal}
                </span>
                <ExecutionStatusBadge status={s.status} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {!loading && result.pagination.pages > 1 && (
        <div className="mt-6">
          <Pagination page={page} pages={result.pagination.pages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;
