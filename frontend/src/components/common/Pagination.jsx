import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const buildPageList = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const withGaps = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) withGaps.push("...");
    withGaps.push(p);
  });
  return withGaps;
};

const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-800 dark:text-paper-100 hover:bg-ink-900/5 dark:hover:bg-paper-100/10 disabled:opacity-30"
      >
        <FiChevronLeft size={16} />
      </button>

      {buildPageList(page, pages).map((p, i) =>
        p === "..." ? (
          <span key={`gap-${i}`} className="px-2 font-body text-sm text-ink-800/40 dark:text-paper-100/40">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`flex h-9 w-9 items-center justify-center rounded-lg font-mono text-sm ${
              p === page
                ? "bg-duel-500 text-white"
                : "text-ink-800 hover:bg-ink-900/5 dark:text-paper-100 dark:hover:bg-paper-100/10"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        aria-label="Next page"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-800 dark:text-paper-100 hover:bg-ink-900/5 dark:hover:bg-paper-100/10 disabled:opacity-30"
      >
        <FiChevronRight size={16} />
      </button>
    </nav>
  );
};

export default Pagination;
