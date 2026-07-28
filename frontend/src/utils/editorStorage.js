const CODE_PREFIX = "editor:code:";
const LANGUAGE_PREFIX = "editor:lastLanguage:";
const SETTINGS_KEY = "editor:settings";

/**
 * Per-problem, per-language autosave. Debounced by the caller (CodeEditor),
 * not here — this module just does the raw read/write.
 */
export const saveCode = (problemId, language, code) => {
  try {
    localStorage.setItem(`${CODE_PREFIX}${problemId}:${language}`, code);
  } catch {
    // localStorage can throw in private-browsing/quota-exceeded edge cases —
    // autosave failing silently is preferable to crashing the editor.
  }
};

export const loadCode = (problemId, language) => {
  try {
    return localStorage.getItem(`${CODE_PREFIX}${problemId}:${language}`);
  } catch {
    return null;
  }
};

export const clearSavedCode = (problemId, language) => {
  try {
    localStorage.removeItem(`${CODE_PREFIX}${problemId}:${language}`);
  } catch {
    // no-op
  }
};

export const saveLastLanguage = (problemId, language) => {
  try {
    localStorage.setItem(`${LANGUAGE_PREFIX}${problemId}`, language);
  } catch {
    // no-op
  }
};

export const loadLastLanguage = (problemId) => {
  try {
    return localStorage.getItem(`${LANGUAGE_PREFIX}${problemId}`);
  } catch {
    return null;
  }
};

// --- Global editor preferences (font size, minimap, theme override) ---
const DEFAULT_SETTINGS = { fontSize: 14, minimap: false, theme: "auto" };

export const loadEditorSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveEditorSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // no-op
  }
};
