const STYLES = {
  Easy: "bg-pass/10 text-pass",
  Medium: "bg-amber-500/10 text-amber-500",
  Hard: "bg-fail/10 text-fail",
};

const DifficultyBadge = ({ difficulty, className = "" }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-body text-xs font-medium ${
      STYLES[difficulty] || "bg-ink-600/10 text-ink-800"
    } ${className}`}
  >
    {difficulty}
  </span>
);

export default DifficultyBadge;
