import { FiCode, FiUsers } from "react-icons/fi";
import { timeAgo } from "./RecentSubmissions";

const dotColor = (event) => {
  if (event.type === "battle") return "bg-duel-500";
  if (event.status === "Accepted") return "bg-pass";
  return "bg-fail";
};

const describeEvent = (event) => {
  if (event.type === "battle") {
    return `Battled on "${event.problemTitle}"`;
  }
  return `${event.status} — "${event.problemTitle}"`;
};

const ActivityTimeline = ({ events = [] }) => {
  if (events.length === 0) {
    return (
      <p className="font-body text-sm text-ink-800/50 dark:text-paper-100/50">
        Your activity — submissions and battles — will show up here as a timeline once you start
        solving.
      </p>
    );
  }

  return (
    <ol className="relative space-y-6 border-l border-ink-600/15 dark:border-paper-200/15 pl-6">
      {events.map((event) => (
        <li key={`${event.type}-${event.id}`} className="relative">
          <span
            className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full ring-4 ring-paper-50 dark:ring-ink-900 ${dotColor(
              event
            )}`}
          />
          <div className="flex items-center gap-2 font-body text-xs text-ink-800/40 dark:text-paper-100/40">
            {event.type === "battle" ? <FiUsers size={12} /> : <FiCode size={12} />}
            {timeAgo(event.createdAt)}
          </div>
          <p className="mt-0.5 font-body text-sm">{describeEvent(event)}</p>
        </li>
      ))}
    </ol>
  );
};

export default ActivityTimeline;
