import { useEffect, useState } from "react";
import { FiWifiOff } from "react-icons/fi";
import Spinner from "../common/Spinner";

/**
 * `mode`: "self" (your own socket dropped, Socket.IO is auto-retrying) or
 * "opponent" (they dropped, `graceMs` is how long before it becomes a forfeit).
 */
const ReconnectOverlay = ({ mode, graceMs = 30000 }) => {
  const [secondsLeft, setSecondsLeft] = useState(Math.round(graceMs / 1000));

  useEffect(() => {
    if (mode !== "opponent") return;
    setSecondsLeft(Math.round(graceMs / 1000));
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(s - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, graceMs]);

  if (!mode) return null;

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-ink-900/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-paper-100/10 bg-ink-800 p-8 text-center">
        {mode === "self" ? (
          <>
            <Spinner size="lg" className="mx-auto text-duel-400" />
            <p className="mt-4 font-display text-base font-semibold text-paper-100">Reconnecting…</p>
            <p className="mt-1 font-body text-sm text-paper-100/60">
              Your connection dropped. We're trying to get you back into the battle.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-fail/15 text-fail">
              <FiWifiOff size={22} />
            </div>
            <p className="mt-4 font-display text-base font-semibold text-paper-100">Opponent disconnected</p>
            <p className="mt-1 font-body text-sm text-paper-100/60">
              Waiting {secondsLeft}s for them to reconnect before it counts as a forfeit.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ReconnectOverlay;
