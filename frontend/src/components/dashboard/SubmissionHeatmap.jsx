const LEVELS = [
  "bg-ink-600/10 dark:bg-paper-200/[0.06]", // 0
  "bg-duel-500/25",
  "bg-duel-500/50",
  "bg-duel-500/75",
  "bg-duel-500", // 4+
];

const levelFor = (count) => {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
};

/**
 * Renders a 53-week x 7-day contribution grid ending today, GitHub-style.
 * Built as plain CSS grid squares rather than a chart, since heatmap
 * calendars aren't a core Chart.js chart type.
 */
const SubmissionHeatmap = ({ data = [] }) => {
  const countByDate = new Map(data.map((d) => [d._id, d.count]));

  const today = new Date();
  const days = [];
  for (let i = 363; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: countByDate.get(key) || 0 });
  }

  // Pad the front so the grid starts on a Sunday column
  const firstDay = new Date(days[0].date).getDay();
  const padded = Array(firstDay).fill(null).concat(days);

  const weeks = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  const totalSubmissions = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div>
      <div className="flex gap-[3px] overflow-x-auto pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) =>
              day ? (
                <div
                  key={di}
                  title={`${day.date}: ${day.count} submission${day.count === 1 ? "" : "s"}`}
                  className={`h-[10px] w-[10px] rounded-[2px] ${LEVELS[levelFor(day.count)]}`}
                />
              ) : (
                <div key={di} className="h-[10px] w-[10px]" />
              )
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between font-body text-xs text-ink-800/50 dark:text-paper-100/50">
        <span>{totalSubmissions} submissions in the last year</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          {LEVELS.map((cls, i) => (
            <span key={i} className={`h-[10px] w-[10px] rounded-[2px] ${cls}`} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default SubmissionHeatmap;
