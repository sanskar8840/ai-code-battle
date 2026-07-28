import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiCheckCircle, FiPlus, FiCode } from "react-icons/fi";
import toast from "react-hot-toast";
import problemService from "../../services/problemService";
import DifficultyBadge from "../../components/problems/DifficultyBadge";
import ProblemFilters from "../../components/problems/ProblemFilters";
import Pagination from "../../components/common/Pagination";
import EmptyState from "../../components/common/EmptyState";
import { ProblemListSkeleton } from "../../components/common/Skeleton";

const DEFAULT_FILTERS = { search: "", difficulty: [], tags: [], companies: [], sort: "newest" };

const useDebouncedValue = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const ProblemList = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "admin";

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [result, setResult] = useState({ problems: [], pagination: { pages: 1, total: 0 } });
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebouncedValue(filters.search);

  useEffect(() => {
    problemService.getFilterMeta().then(setMeta).catch(() => {});
  }, []);

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch,
      difficulty: filters.difficulty?.join(","),
      tags: filters.tags?.join(","),
      companies: filters.companies?.join(","),
      sort: filters.sort,
      page,
      limit: 15,
    }),
    [debouncedSearch, filters.difficulty, filters.tags, filters.companies, filters.sort, page]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    problemService
      .getProblems(queryParams)
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((err) => {
        if (!cancelled) toast.error(err.message || "Couldn't load problems");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [queryParams]);

  // Reset to page 1 whenever a filter (not the page itself) changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.difficulty, filters.tags, filters.companies, filters.sort]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Problems</h1>
          <p className="mt-1 font-body text-sm text-ink-800/60 dark:text-paper-100/60">
            {result.pagination.total} problem{result.pagination.total === 1 ? "" : "s"} to sharpen your skills on.
          </p>
        </div>
        {isAdmin && (
          <Link to="/admin/problems/new" className="btn-primary">
            <FiPlus size={16} /> New problem
          </Link>
        )}
      </div>

      <div className="mt-6">
        <ProblemFilters filters={filters} onChange={setFilters} meta={meta} />
      </div>

      <div className="mt-6">
        {loading ? (
          <ProblemListSkeleton rows={10} />
        ) : result.problems.length === 0 ? (
          <EmptyState
            icon={FiCode}
            title="No problems match your filters"
            description="Try broadening your search or clearing a few filters."
          />
        ) : (
          <div className="card overflow-hidden">
            {result.problems.map((p) => (
              <Link
                key={p._id}
                to={`/problems/${p.slug}`}
                className="flex items-center justify-between gap-4 border-b border-ink-600/10 px-4 py-4 transition-colors last:border-0 hover:bg-ink-900/[0.02] dark:border-paper-200/10 dark:hover:bg-paper-100/[0.03] sm:px-5"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <FiCheckCircle
                    className={p.solved ? "shrink-0 text-pass" : "shrink-0 text-ink-600/20 dark:text-paper-200/20"}
                    size={16}
                  />
                  <span className="truncate font-body text-sm font-medium">{p.title}</span>
                  {!p.isPublished && (
                    <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 font-body text-[10px] font-medium text-amber-600">
                      Draft
                    </span>
                  )}
                </div>

                <div className="hidden shrink-0 gap-1 sm:flex">
                  {p.tags?.slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded-full bg-ink-600/5 px-2 py-0.5 font-mono text-[10px] text-ink-800/50 dark:bg-paper-200/5 dark:text-paper-100/50">
                      {tag}
                    </span>
                  ))}
                </div>

                <span className="hidden shrink-0 font-mono text-xs text-ink-800/50 dark:text-paper-100/50 md:block">
                  {p.acceptanceRate?.toFixed(1) ?? "0.0"}%
                </span>

                <DifficultyBadge difficulty={p.difficulty} className="shrink-0" />
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

export default ProblemList;
