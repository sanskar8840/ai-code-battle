import { FiCheckCircle, FiXCircle, FiClock, FiAlertTriangle, FiCpu, FiHelpCircle } from "react-icons/fi";

const STATUS_CONFIG = {
  Accepted: { color: "text-pass bg-pass/10", icon: FiCheckCircle },
  "Wrong Answer": { color: "text-fail bg-fail/10", icon: FiXCircle },
  "Time Limit Exceeded": { color: "text-amber-500 bg-amber-500/10", icon: FiClock },
  "Memory Limit Exceeded": { color: "text-amber-500 bg-amber-500/10", icon: FiCpu },
  "Compilation Error": { color: "text-fail bg-fail/10", icon: FiAlertTriangle },
  "Runtime Error": { color: "text-fail bg-fail/10", icon: FiAlertTriangle },
  "Internal Error": { color: "text-ink-800/60 bg-ink-600/10 dark:text-paper-100/60", icon: FiHelpCircle },
  "Exec Format Error": { color: "text-ink-800/60 bg-ink-600/10 dark:text-paper-100/60", icon: FiHelpCircle },
  Processing: { color: "text-duel-500 bg-duel-500/10", icon: FiClock },
};

const ExecutionStatusBadge = ({ status, size = "md" }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG["Internal Error"];
  const Icon = config.icon;
  const sizeClasses = size === "lg" ? "px-3 py-1.5 text-sm gap-2" : "px-2.5 py-1 text-xs gap-1.5";

  return (
    <span className={`inline-flex items-center rounded-full font-body font-semibold ${config.color} ${sizeClasses}`}>
      <Icon size={size === "lg" ? 16 : 13} />
      {status}
    </span>
  );
};

export default ExecutionStatusBadge;
