import { FiUsers } from "react-icons/fi";
import { useSelector } from "react-redux";
import { timeAgo } from "./RecentSubmissions";

const RESULT_STYLE = {
  win: { label: "Won", color: "text-pass" },
  loss: { label: "Lost", color: "text-fail" },
  draw: { label: "Draw", color: "text-amber-500" },
};

const RecentBattles = ({ battles = [] }) => {
  const { user } = useSelector((state) => state.auth);

  if (battles.length === 0) {
    return (
      <p className="font-body text-sm text-ink-800/50 dark:text-paper-100/50">
        No battles yet — real-time 1v1 duels ship in Phase 9. Queue up once they're live.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-ink-600/10 dark:divide-paper-200/10">
      {battles.map((b) => {
        const mySlot = b.players.find((p) => p.user?._id === user?._id);
        const opponent = b.players.find((p) => p.user?._id !== user?._id);
        const result = RESULT_STYLE[mySlot?.result] || RESULT_STYLE.draw;
        const delta = mySlot ? mySlot.ratingAfter - mySlot.ratingBefore : 0;

        return (
          <li key={b._id} className="flex items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <FiUsers className="shrink-0 text-duel-500" size={16} />
              <div className="min-w-0">
                <p className="truncate font-body text-sm font-medium">
                  vs {opponent?.user?.name || "Unknown opponent"}
                </p>
                <p className="truncate font-mono text-xs text-ink-800/50 dark:text-paper-100/50">
                  {b.problemTitle}
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className={`font-body text-xs font-medium ${result.color}`}>
                {result.label} {delta !== 0 && `(${delta > 0 ? "+" : ""}${delta})`}
              </p>
              <p className="font-body text-[11px] text-ink-800/40 dark:text-paper-100/40">
                {timeAgo(b.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default RecentBattles;
