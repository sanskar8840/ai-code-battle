import { FiInbox } from "react-icons/fi";

const EmptyState = ({ icon: Icon = FiInbox, title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-600/20 dark:border-paper-200/15 px-6 py-16 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-600/5 dark:bg-paper-200/5 text-ink-800/40 dark:text-paper-100/40">
      <Icon size={22} />
    </div>
    <h3 className="mt-4 font-display text-base font-semibold">{title}</h3>
    {description && (
      <p className="mt-1 max-w-sm font-body text-sm text-ink-800/60 dark:text-paper-100/60">{description}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
