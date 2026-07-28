import { FiCheckCircle, FiXCircle } from "react-icons/fi";

const STATUS_STYLE = {
  Accepted: { color: "text-pass", icon: FiCheckCircle },
  "Wrong Answer": { color: "text-fail", icon: FiXCircle },
  "Time Limit Exceeded": { color: "text-amber-500", icon: FiXCircle },
  "Runtime Error": { color: "text-fail", icon: FiXCircle },
  "Compilation Error": { color: "text-fail", icon: FiXCircle },
  "Memory Limit Exceeded": { color: "text-amber-500", icon: FiXCircle },
};

const DIFFICULTY_COLOR = { Easy: "text-pass", Medium: "text-amber-500", Hard: "text-fail" };

const timeAgo = (dateStr) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  const units = [
    ["y", 31536000],
    ["mo", 2592000],
    ["d", 86400],
    ["h", 3600],
    ["m", 60],
  ];
  for (const [label, secs] of units) {
    const val = Math.floor(seconds / secs);
    if (val >= 1) return `${val}${label} ago`;
  }
  return "just now";
};

const RecentSubmissions = ({ submissions = [] }) => {
  if (submissions.length === 0) {
    return (
      <p className="font-body text-sm text-ink-800/50 dark:text-paper-100/50">
        No submissions yet — once the problem system ships, your attempts will show up here.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-ink-600/10 dark:divide-paper-200/10">
      {submissions.map((s) => {
        const style = STATUS_STYLE[s.status] || STATUS_STYLE["Wrong Answer"];
        const Icon = style.icon;
        return (
          <li key={s._id} className="flex items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <Icon className={`shrink-0 ${style.color}`} size={16} />
              <div className="min-w-0">
                <p className="truncate font-body text-sm font-medium">{s.problemTitle}</p>
                <p className="font-mono text-xs text-ink-800/50 dark:text-paper-100/50">
                  <span className={DIFFICULTY_COLOR[s.difficulty]}>{s.difficulty}</span> · {s.language}
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className={`font-body text-xs font-medium ${style.color}`}>{s.status}</p>
              <p className="font-body text-[11px] text-ink-800/40 dark:text-paper-100/40">
                {timeAgo(s.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default RecentSubmissions;
export { timeAgo };
