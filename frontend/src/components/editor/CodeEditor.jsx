import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import toast from "react-hot-toast";
import { FiCommand } from "react-icons/fi";
import EditorToolbar from "./EditorToolbar";
import { useTheme } from "../../context/ThemeContext";
import Spinner from "../common/Spinner";
import {
  saveCode,
  loadCode,
  clearSavedCode,
  saveLastLanguage,
  loadLastLanguage,
  loadEditorSettings,
  saveEditorSettings,
} from "../../utils/editorStorage";

const AUTOSAVE_DELAY_MS = 600;

/**
 * `problem` needs: { _id, slug, supportedLanguages, starterCode }
 * `languages` is the full list from GET /api/languages: [{ id, label, monacoLanguage, extension }]
 * `onStateChange({ language, code })` fires on every meaningful change — Phase 8's
 * Judge0 "Run"/"Submit" buttons will read the latest value from here.
 */
const CodeEditor = ({ problem, languages, onStateChange }) => {
  const { theme: appTheme } = useTheme();
  const settings = useMemo(() => loadEditorSettings(), []);

  const supportedLanguages = useMemo(
    () => languages.filter((l) => problem.supportedLanguages?.includes(l.id)),
    [languages, problem.supportedLanguages]
  );

  const [language, setLanguage] = useState(
    () => loadLastLanguage(problem._id) || supportedLanguages[0]?.id || "cpp"
  );
  const [code, setCode] = useState(() => {
    const saved = loadCode(problem._id, language);
    return saved ?? problem.starterCode?.[language] ?? "";
  });
  const [fontSize, setFontSize] = useState(settings.fontSize);
  const [minimap, setMinimap] = useState(settings.minimap);
  const [editorTheme, setEditorTheme] = useState(settings.theme === "auto" ? appTheme : settings.theme);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState("");

  const editorRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const indicatorTimeoutRef = useRef(null);

  const currentLangMeta = supportedLanguages.find((l) => l.id === language) || supportedLanguages[0];

  // --- Notify parent (Phase 8 hook point) whenever language or code changes ---
  useEffect(() => {
    onStateChange?.({ language, code });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, code]);

  // --- Debounced autosave to localStorage ---
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveCode(problem._id, language, code);
      setSavedIndicator("Saved");
      if (indicatorTimeoutRef.current) clearTimeout(indicatorTimeoutRef.current);
      indicatorTimeoutRef.current = setTimeout(() => setSavedIndicator(""), 1500);
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [code, language, problem._id]);

  const handleLanguageChange = (newLang) => {
    saveCode(problem._id, language, code); // flush current language before switching
    saveLastLanguage(problem._id, newLang);
    const saved = loadCode(problem._id, newLang);
    setCode(saved ?? problem.starterCode?.[newLang] ?? "");
    setLanguage(newLang);
  };

  const handleReset = useCallback(() => {
    if (!window.confirm("Reset to starter code? This will discard your current changes for this language.")) {
      return;
    }
    const starter = problem.starterCode?.[language] ?? "";
    setCode(starter);
    clearSavedCode(problem._id, language);
    toast.success("Reset to starter code");
  }, [language, problem]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard");
    } catch {
      toast.error("Couldn't copy — your browser may be blocking clipboard access");
    }
  }, [code]);

  const handleDownload = useCallback(() => {
    const ext = currentLangMeta?.extension || "txt";
    const filename = `${problem.slug || "solution"}.${ext}`;
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  }, [code, currentLangMeta, problem.slug]);

  const handleManualSave = useCallback(() => {
    saveCode(problem._id, language, code);
    toast.success("Code saved");
  }, [code, language, problem._id]);

  const handleThemeToggle = () => {
    const next = editorTheme === "dark" ? "light" : "dark";
    setEditorTheme(next);
    saveEditorSettings({ ...loadEditorSettings(), theme: next });
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    saveEditorSettings({ ...loadEditorSettings(), fontSize: size });
  };

  const handleMinimapToggle = () => {
    const next = !minimap;
    setMinimap(next);
    saveEditorSettings({ ...loadEditorSettings(), minimap: next });
  };

  // --- Keyboard shortcuts (global, active while this editor is mounted) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key === "Enter") {
        e.preventDefault();
        toast("Run & Submit connect to Judge0 in Phase 8 — your code is saved and ready.", { icon: "⚙️" });
      } else if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleManualSave();
      } else if (mod && e.shiftKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        handleReset();
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleManualSave, handleReset, isFullscreen]);

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const wrapperClass = isFullscreen
    ? "fixed inset-0 z-50 flex flex-col bg-paper-50 dark:bg-ink-900"
    : "card flex flex-col overflow-hidden";

  return (
    <div className={wrapperClass}>
      <EditorToolbar
        languages={supportedLanguages}
        language={language}
        onLanguageChange={handleLanguageChange}
        editorTheme={editorTheme}
        onThemeChange={handleThemeToggle}
        fontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
        minimap={minimap}
        onMinimapToggle={handleMinimapToggle}
        isFullscreen={isFullscreen}
        onFullscreenToggle={() => setIsFullscreen((f) => !f)}
        onReset={handleReset}
        onCopy={handleCopy}
        onDownload={handleDownload}
        savedIndicator={savedIndicator}
      />

      <div className={isFullscreen ? "flex-1" : "h-[480px]"}>
        <Editor
          language={currentLangMeta?.monacoLanguage || "plaintext"}
          value={code}
          onChange={(value) => setCode(value ?? "")}
          theme={editorTheme === "dark" ? "vs-dark" : "light"}
          onMount={handleEditorMount}
          loading={
            <div className="flex h-full items-center justify-center">
              <Spinner size="lg" />
            </div>
          }
          options={{
            fontSize,
            minimap: { enabled: minimap },
            lineNumbers: "on",
            fontFamily: "'JetBrains Mono', monospace",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 16 },
            renderLineHighlight: "gutter",
            cursorBlinking: "smooth",
          }}
        />
      </div>

      <div className="flex items-center gap-1.5 border-t border-ink-600/10 px-3 py-1.5 font-body text-[11px] text-ink-800/40 dark:border-paper-200/10 dark:text-paper-100/40">
        <FiCommand size={11} />
        <span>Ctrl+Enter run · Ctrl+S save · Ctrl+Shift+R reset · Esc exit fullscreen</span>
      </div>
    </div>
  );
};

export default CodeEditor;
