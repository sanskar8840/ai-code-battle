import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiClock } from "react-icons/fi";
import battleService from "../../services/battleService";
import Pagination from "../../components/common/Pagination";
import EmptyState from "../../components/common/EmptyState";
import { ProblemListSkeleton } from "../../components/common/Skeleton";

const RESULT_STYLE = {
  win: "text-pass bg-pass/10",
  loss: "text-fail bg-fail/10",
  draw: "text-amber-500 bg-amber-500/10",
};

const formatDuration = (seconds) => {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

const BattleHistory = () => {
  const { user } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ battles: [], pagination: { pages: 1, total: 0 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    battleService
      .getMyBattles({ page, limit: 15 })
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((err) => toast.error(err.message || "Couldn't load battle history"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <h1 className="font-display text-2xl font-bold">Battle history</h1>
      <p className="mt-1 font-body text-sm text-ink-800/60 dark:text-paper-100/60">
        {result.pagination.total} battle{result.pagination.total === 1 ? "" : "s"} fought
      </p>

      <div className="mt-6">
        {loading ? (
          <ProblemListSkeleton rows={8} />
        ) : result.battles.length === 0 ? (
          <EmptyState
            icon={FiClock}
            title="No battles yet"
            description="Head to the lobby and find your first opponent."
            action={
              <Link to="/battles" className="btn-primary">
                Go to lobby
              </Link>
            }
          />
        ) : (
          <div className="card overflow-hidden">
            {result.battles.map((b) => {
              const mySlot = b.players.find((p) => p.user?._id === user?._id);
              const opponent = b.players.find((p) => p.user?._id !== user?._id);
              const delta = mySlot ? mySlot.ratingAfter - mySlot.ratingBefore : 0;

              return (
                <Link
                  key={b._id}
                  to={`/battles/result/${b.roomId || b._id}`}
                  className="flex items-center justify-between gap-4 border-b border-ink-600/10 px-4 py-4 transition-colors last:border-0 hover:bg-ink-900/[0.02] dark:border-paper-200/10 dark:hover:bg-paper-100/[0.03] sm:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body text-sm font-medium">vs {opponent?.user?.name || "Unknown"}</p>
                    <p className="truncate font-mono text-xs text-ink-800/50 dark:text-paper-100/50">
                      {b.problemTitle} · {formatDuration(b.durationSeconds)}
                    </p>
                  </div>
                  <span className="hidden font-mono text-xs text-ink-800/50 dark:text-paper-100/50 sm:block">
                    {delta > 0 ? "+" : ""}{delta}
                  </span>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 font-body text-xs font-semibold capitalize ${RESULT_STYLE[mySlot?.result] || RESULT_STYLE.draw}`}>
                    {mySlot?.result || "draw"}
                  </span>
                </Link>
              );
            })}
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

export default BattleHistory;
