import { FiSearch, FiX } from "react-icons/fi";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "title-asc", label: "Title A-Z" },
  { value: "title-desc", label: "Title Z-A" },
  { value: "acceptance-desc", label: "Acceptance: High to low" },
  { value: "acceptance-asc", label: "Acceptance: Low to high" },
];

/**
 * Controlled filter bar. `filters` = { search, difficulty, tags, companies, sort }
 * where difficulty/tags/companies are arrays. `meta` = { tags, companies } from
 * GET /problems/meta/filters, used to populate the dropdowns.
 */
const ProblemFilters = ({ filters, onChange, meta }) => {
  const toggleArrayValue = (key, value) => {
    const current = filters[key] || [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  const hasActiveFilters =
    filters.search || filters.difficulty?.length || filters.tags?.length || filters.companies?.length;

  const clearAll = () => onChange({ search: "", difficulty: [], tags: [], companies: [], sort: filters.sort });

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-800/40 dark:text-paper-100/40" size={16} />
          <input
            type="search"
            value={filters.search || ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search problems by title or tag..."
            className="input-field pl-9"
          />
        </div>

        <select
          value={filters.sort || "newest"}
          onChange={(e) => onChange({ ...filters, sort: e.target.value })}
          className="input-field sm:w-56"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 font-body text-xs font-medium text-ink-800/50 dark:text-paper-100/50">Difficulty:</span>
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => toggleArrayValue("difficulty", d)}
            className={`rounded-full border px-3 py-1 font-body text-xs font-medium transition-colors ${
              filters.difficulty?.includes(d)
                ? "border-duel-500 bg-duel-500 text-white"
                : "border-ink-600/20 text-ink-800/70 hover:border-duel-500/50 dark:border-paper-200/15 dark:text-paper-100/70"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {meta?.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="mr-1 font-body text-xs font-medium text-ink-800/50 dark:text-paper-100/50">Tags:</span>
          {meta.tags.slice(0, 12).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleArrayValue("tags", tag)}
              className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
                filters.tags?.includes(tag)
                  ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "border-ink-600/20 text-ink-800/60 hover:border-amber-500/50 dark:border-paper-200/15 dark:text-paper-100/60"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {meta?.companies?.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="mr-1 font-body text-xs font-medium text-ink-800/50 dark:text-paper-100/50">Companies:</span>
          {meta.companies.slice(0, 10).map((company) => (
            <button
              key={company}
              type="button"
              onClick={() => toggleArrayValue("companies", company)}
              className={`rounded-full border px-3 py-1 font-body text-xs transition-colors ${
                filters.companies?.includes(company)
                  ? "border-duel-500 bg-duel-500/10 text-duel-500"
                  : "border-ink-600/20 text-ink-800/60 hover:border-duel-500/50 dark:border-paper-200/15 dark:text-paper-100/60"
              }`}
            >
              {company}
            </button>
          ))}
        </div>
      )}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="mt-4 flex items-center gap-1 font-body text-xs font-medium text-fail hover:underline"
        >
          <FiX size={12} /> Clear all filters
        </button>
      )}
    </div>
  );
};

export default ProblemFilters;
