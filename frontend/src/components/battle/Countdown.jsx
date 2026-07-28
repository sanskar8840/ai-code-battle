import { motion, AnimatePresence } from "framer-motion";

const Countdown = ({ value }) => {
  if (value === null || value === undefined) return null;

  const label = value > 0 ? value : "GO!";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/80 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={label}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className={`font-display text-8xl font-extrabold ${value > 0 ? "text-paper-100" : "text-pass"}`}
        >
          {label}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Countdown;
