import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FiZap, FiClock, FiAward } from "react-icons/fi";
import battleService from "../../services/battleService";

const RESULT_STYLE = {
  win: "text-pass bg-pass/10",
  loss: "text-fail bg-fail/10",
  draw: "text-amber-500 bg-amber-500/10",
};

const BattleLobby = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [recentBattles, setRecentBattles] = useState([]);

  useEffect(() => {
    battleService
      .getMyBattles({ limit: 4 })
      .then((data) => setRecentBattles(data.battles))
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl bg-ink-900 p-8 text-center sm:p-12">
        <div className="absolute inset-0 bg-arena-grid bg-[size:32px_32px] opacity-30" />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-duel-500 text-white shadow-glow">
            <FiZap size={24} />
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold text-paper-100 sm:text-3xl">Ready to duel?</h1>
          <p className="mx-auto mt-2 max-w-md font-body text-sm text-paper-100/60">
            Get matched with someone near your rating, solve the same problem, first to Accepted wins.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 font-mono text-sm text-amber-500">
            <FiAward size={16} /> {user?.rating ?? 1200} ELO
          </div>

          <button
            type="button"
            onClick={() => navigate("/battles/matchmaking")}
            className="btn-primary mt-8 px-8 py-3 text-base"
          >
            <FiZap size={16} /> Find match
          </button>
        </motion.div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Recent battles</h2>
        <Link to="/battles/history" className="font-body text-sm text-duel-500 hover:underline">
          View all
        </Link>
      </div>

      <div className="mt-4">
        {recentBattles.length === 0 ? (
          <div className="card p-8 text-center">
            <FiClock className="mx-auto text-ink-800/30 dark:text-paper-100/30" size={22} />
            <p className="mt-2 font-body text-sm text-ink-800/60 dark:text-paper-100/60">
              No battles yet — your first one is one click away.
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            {recentBattles.map((b) => {
              const mySlot = b.players.find((p) => p.user?._id === user?._id);
              const opponent = b.players.find((p) => p.user?._id !== user?._id);
              return (
                <Link
                  key={b._id}
                  to={`/battles/result/${b.roomId || b._id}`}
                  className="flex items-center justify-between gap-3 border-b border-ink-600/10 px-4 py-3 transition-colors last:border-0 hover:bg-ink-900/[0.02] dark:border-paper-200/10 dark:hover:bg-paper-100/[0.03]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-body text-sm font-medium">vs {opponent?.user?.name || "Unknown"}</p>
                    <p className="truncate font-mono text-xs text-ink-800/50 dark:text-paper-100/50">{b.problemTitle}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 font-body text-xs font-semibold capitalize ${RESULT_STYLE[mySlot?.result] || RESULT_STYLE.draw}`}>
                    {mySlot?.result || "draw"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleLobby;
