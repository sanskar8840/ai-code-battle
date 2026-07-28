const ProgressBar = ({ passed = 0, total = 0, solved = false }) => {
  const pct = total > 0 ? Math.round((passed / total) * 100) : 0;

  return (
    <div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-600/10 dark:bg-paper-200/10">
        <div
          className={`h-full rounded-full transition-all duration-500 ${solved ? "bg-pass" : "bg-duel-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 font-mono text-[11px] text-ink-800/50 dark:text-paper-100/50">
        {total > 0 ? `${passed}/${total} test cases` : "No attempts yet"}
      </p>
    </div>
  );
};

export default ProgressBar;
