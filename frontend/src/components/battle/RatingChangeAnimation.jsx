import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiArrowUp, FiArrowDown, FiMinus } from "react-icons/fi";

const RatingChangeAnimation = ({ before, after, delta }) => {
  const [display, setDisplay] = useState(before);

  useEffect(() => {
    const duration = 1200;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3; // ease-out cubic
      setDisplay(Math.round(before + (after - before) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [before, after]);

  const Icon = delta > 0 ? FiArrowUp : delta < 0 ? FiArrowDown : FiMinus;
  const color = delta > 0 ? "text-pass" : delta < 0 ? "text-fail" : "text-ink-800/50 dark:text-paper-100/50";

  return (
    <div className="text-center">
      <p className="font-mono text-3xl font-bold tabular-nums">{display}</p>
      <motion.p
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={`mt-1 flex items-center justify-center gap-1 font-mono text-sm font-semibold ${color}`}
      >
        <Icon size={13} />
        {delta > 0 ? "+" : ""}{delta}
      </motion.p>
    </div>
  );
};

export default RatingChangeAnimation;
