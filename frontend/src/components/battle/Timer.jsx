import { FiClock } from "react-icons/fi";

const formatTime = (totalSeconds) => {
  const safe = Math.max(totalSeconds, 0);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const Timer = ({ remainingSeconds, totalSeconds = 1200 }) => {
  const ratio = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const isCritical = remainingSeconds <= 60;
  const isWarning = !isCritical && ratio <= 0.25;

  const color = isCritical ? "text-fail" : isWarning ? "text-amber-500" : "text-ink-900 dark:text-paper-100";

  return (
    <div className={`flex items-center gap-2 font-mono text-lg font-semibold tabular-nums ${color} ${isCritical ? "animate-pulse" : ""}`}>
      <FiClock size={16} />
      {formatTime(remainingSeconds)}
    </div>
  );
};

export default Timer;
