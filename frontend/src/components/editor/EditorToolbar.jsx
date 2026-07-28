import {
  FiCopy,
  FiDownload,
  FiMaximize,
  FiMinimize,
  FiRotateCcw,
  FiSun,
  FiMoon,
  FiMap,
} from "react-icons/fi";

const FONT_SIZES = [12, 13, 14, 16, 18, 20];

const EditorToolbar = ({
  languages,
  language,
  onLanguageChange,
  editorTheme,
  onThemeChange,
  fontSize,
  onFontSizeChange,
  minimap,
  onMinimapToggle,
  isFullscreen,
  onFullscreenToggle,
  onReset,
  onCopy,
  onDownload,
  savedIndicator,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-600/10 bg-ink-900/[0.02] px-3 py-2 dark:border-paper-200/10 dark:bg-paper-100/[0.02]">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          aria-label="Select language"
          className="rounded-md border border-ink-600/20 bg-white px-2.5 py-1.5 font-mono text-xs dark:border-paper-200/15 dark:bg-ink-800"
        >
          {languages.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>

        <select
          value={fontSize}
          onChange={(e) => onFontSizeChange(Number(e.target.value))}
          aria-label="Font size"
          className="rounded-md border border-ink-600/20 bg-white px-2.5 py-1.5 font-mono text-xs dark:border-paper-200/15 dark:bg-ink-800"
        >
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>

        {savedIndicator && (
          <span className="hidden font-body text-[11px] text-ink-800/40 dark:text-paper-100/40 sm:inline">
            {savedIndicator}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onMinimapToggle}
          aria-label="Toggle minimap"
          aria-pressed={minimap}
          title="Toggle minimap"
          className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
            minimap
              ? "bg-duel-500/15 text-duel-500"
              : "text-ink-800/60 hover:bg-ink-900/5 dark:text-paper-100/60 dark:hover:bg-paper-100/10"
          }`}
        >
          <FiMap size={15} />
        </button>

        <button
          type="button"
          onClick={onThemeChange}
          aria-label="Toggle editor theme"
          title="Toggle editor theme"
          className="flex h-8 w-8 items-center justify-center rounded-md text-ink-800/60 hover:bg-ink-900/5 dark:text-paper-100/60 dark:hover:bg-paper-100/10"
        >
          {editorTheme === "dark" ? <FiSun size={15} /> : <FiMoon size={15} />}
        </button>

        <button
          type="button"
          onClick={onReset}
          aria-label="Reset to starter code"
          title="Reset to starter code (Ctrl+Shift+R)"
          className="flex h-8 w-8 items-center justify-center rounded-md text-ink-800/60 hover:bg-ink-900/5 dark:text-paper-100/60 dark:hover:bg-paper-100/10"
        >
          <FiRotateCcw size={15} />
        </button>

        <button
          type="button"
          onClick={onCopy}
          aria-label="Copy code"
          title="Copy code"
          className="flex h-8 w-8 items-center justify-center rounded-md text-ink-800/60 hover:bg-ink-900/5 dark:text-paper-100/60 dark:hover:bg-paper-100/10"
        >
          <FiCopy size={15} />
        </button>

        <button
          type="button"
          onClick={onDownload}
          aria-label="Download code"
          title="Download code"
          className="flex h-8 w-8 items-center justify-center rounded-md text-ink-800/60 hover:bg-ink-900/5 dark:text-paper-100/60 dark:hover:bg-paper-100/10"
        >
          <FiDownload size={15} />
        </button>

        <button
          type="button"
          onClick={onFullscreenToggle}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
          className="flex h-8 w-8 items-center justify-center rounded-md text-ink-800/60 hover:bg-ink-900/5 dark:text-paper-100/60 dark:hover:bg-paper-100/10"
        >
          {isFullscreen ? <FiMinimize size={15} /> : <FiMaximize size={15} />}
        </button>
      </div>
    </div>
  );
};

export default EditorToolbar;
