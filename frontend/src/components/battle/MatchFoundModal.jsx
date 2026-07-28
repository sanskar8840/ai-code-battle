import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiZap } from "react-icons/fi";
import { useSelector } from "react-redux";

const AUTO_JOIN_SECONDS = 3;

const MatchFoundModal = ({ opponent, onJoin }) => {
  const { user } = useSelector((state) => state.auth);
  const [secondsLeft, setSecondsLeft] = useState(AUTO_JOIN_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onJoin();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, onJoin]);

  if (!opponent) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md rounded-2xl border border-paper-100/10 bg-ink-800 p-8 text-center shadow-glow"
      >
        <p className="font-mono text-xs uppercase tracking-wider text-duel-400">Match found</p>

        <div className="mt-6 flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-duel-500/15 font-display text-xl font-bold text-duel-400">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <p className="mt-2 max-w-[80px] truncate font-body text-xs text-paper-100/80">{user?.name}</p>
            <p className="font-mono text-[11px] text-amber-500">{user?.rating}</p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-duel-500 font-display text-sm font-bold text-white">
            VS
          </div>

          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15 font-display text-xl font-bold text-amber-500">
              {opponent.name?.charAt(0).toUpperCase()}
            </div>
            <p className="mt-2 max-w-[80px] truncate font-body text-xs text-paper-100/80">{opponent.name}</p>
            <p className="font-mono text-[11px] text-amber-500">{opponent.rating}</p>
          </div>
        </div>

        <p className="mt-6 font-body text-sm text-paper-100/60">Difficulty: {opponent.difficulty || "matched to your skill"}</p>

        <button
          type="button"
          onClick={onJoin}
          className="btn-primary mt-6 w-full justify-center py-3"
        >
          <FiZap size={16} /> Enter battle ({secondsLeft})
        </button>
      </motion.div>
    </div>
  );
};

export default MatchFoundModal;
