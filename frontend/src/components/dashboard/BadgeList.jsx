import { FiAward } from "react-icons/fi";

const BadgeList = ({ badges = [] }) => {
  if (badges.length === 0) {
    return (
      <p className="font-body text-sm text-ink-800/50 dark:text-paper-100/50">
        No badges yet. Win battles and hit solve milestones to start earning them.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <span
          key={badge}
          className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-body text-xs font-medium text-amber-600 dark:text-amber-400"
        >
          <FiAward size={12} />
          {badge}
        </span>
      ))}
    </div>
  );
};

export default BadgeList;
