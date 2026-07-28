import { FiCheckCircle, FiWifiOff } from "react-icons/fi";
import ProgressBar from "./ProgressBar";
import ExecutionStatusBadge from "../editor/ExecutionStatusBadge";

/**
 * `player` = the sanitized player object from battleService.sanitizeForClient:
 * { userId, username, name, avatar, rating, connected, status, testCasesPassed,
 *   testCasesTotal, submissionCount, runCount, solved }
 */
const OpponentCard = ({ player, isSelf = false }) => {
  if (!player) return null;

  return (
    <div className={`card p-4 ${player.solved ? "ring-1 ring-pass/40" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-duel-500/10 font-display text-sm font-bold text-duel-500">
            {player.avatar ? (
              <img src={player.avatar} alt={player.name} className="h-full w-full object-cover" />
            ) : (
              player.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-body text-sm font-semibold">
              {player.name} {isSelf && <span className="text-ink-800/40 dark:text-paper-100/40">(you)</span>}
            </p>
            <p className="font-mono text-[11px] text-amber-500">{player.rating} ELO</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {!player.connected && (
            <span title="Disconnected" className="text-fail">
              <FiWifiOff size={14} />
            </span>
          )}
          {player.solved && (
            <span title="Solved" className="text-pass">
              <FiCheckCircle size={16} />
            </span>
          )}
        </div>
      </div>

      <div className="mt-3">
        <ProgressBar passed={player.testCasesPassed} total={player.testCasesTotal} solved={player.solved} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {player.status && <ExecutionStatusBadge status={player.status} />}
        <span className="font-mono text-[11px] text-ink-800/40 dark:text-paper-100/40">
          {player.submissionCount} submission{player.submissionCount === 1 ? "" : "s"} · {player.runCount} run{player.runCount === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
};

export default OpponentCard;
