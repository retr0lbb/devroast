"use client";

import { twMerge } from "tailwind-merge";
import { useState, useEffect, useRef, useCallback } from "react";
import hljs from "highlight.js";
import { createHighlighter, type Highlighter } from "shiki";

const MAX_CHARACTERS = 2000;

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

// Supported languages for both Shiki and the manual selector
const SUPPORTED_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "ruby",
  "csharp",
  "cpp",
  "c",
  "java",
  "go",
  "rust",
  "php",
  "html",
  "css",
  "json",
  "xml",
  "sql",
  "bash",
  "yaml",
  "markdown",
  "swift",
  "kotlin",
  "lua",
  "r",
  "dart",
  "scala",
  "elixir",
  "text",
] as const;

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Map highlight.js language aliases → canonical Shiki names
const langMap: Record<string, SupportedLanguage> = {
  js: "javascript",
  javascript: "javascript",
  ts: "typescript",
  typescript: "typescript",
  py: "python",
  python: "python",
  rb: "ruby",
  ruby: "ruby",
  cs: "csharp",
  csharp: "csharp",
  "c#": "csharp",
  cpp: "cpp",
  "c++": "cpp",
  sh: "bash",
  bash: "bash",
  yml: "yaml",
  yaml: "yaml",
  md: "markdown",
  markdown: "markdown",
  sql: "sql",
  php: "php",
  java: "java",
  go: "go",
  rust: "rust",
};

// ── Singleton Highlighter (created once, reused forever) ──────────
let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["vesper"],
      langs: [...SUPPORTED_LANGUAGES],
    });
  }
  return highlighterPromise;
}

// Pre-warm the highlighter as soon as the module loads
getHighlighter();

function resolveLanguage(detected: string): SupportedLanguage {
  const normalized = detected.toLowerCase();
  const mapped = langMap[normalized] || normalized;
  if ((SUPPORTED_LANGUAGES as readonly string[]).includes(mapped)) {
    return mapped as SupportedLanguage;
  }
  return "text";
}

function CodeEditor({ value, onChange, className }: CodeEditorProps) {
  const [isEditing, setIsEditing] = useState(true);
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");
  const [detectedLang, setDetectedLang] = useState<SupportedLanguage>("text");
  const [manualLang, setManualLang] = useState<SupportedLanguage | null>(null);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isOverLimit = value.length > MAX_CHARACTERS;

  const lines = value.split("\n");
  const lineCount = Math.max(lines.length, 16);

  // The effective language: manual override wins over auto-detection
  const effectiveLang = manualLang ?? detectedLang;

  const highlightCode = useCallback(
    async (code: string, lang: SupportedLanguage) => {
      try {
        const highlighter = await getHighlighter();
        const html = highlighter.codeToHtml(code, {
          lang,
          theme: "vesper",
        });
        setHighlightedHtml(html);
      } catch (error) {
        console.error("Failed to highlight code:", error);
      }
    },
    [],
  );

  useEffect(() => {
    if (!value.trim()) {
      setIsEditing(true);
      setHighlightedHtml("");
      setDetectedLang("text");
      setShowLangPicker(false);
      return;
    }

    // Auto-detect only if no manual override
    if (!manualLang) {
      const detection = hljs.highlightAuto(value);
      const rawLang = detection.language || "text";
      const resolved = resolveLanguage(rawLang);
      setDetectedLang(resolved);

      // Show language picker when detection confidence is low
      const isLowConfidence =
        resolved === "text" ||
        (detection.relevance !== undefined && detection.relevance < 5);
      setShowLangPicker(isLowConfidence);
    }

    // Near-instant: 150ms debounce (just enough to batch rapid keystrokes)
    const timeoutId = setTimeout(() => {
      highlightCode(value, manualLang ?? detectedLang);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [value, manualLang, detectedLang, highlightCode]);

  // Re-highlight immediately when manual language changes
  useEffect(() => {
    if (manualLang && value.trim()) {
      highlightCode(value, manualLang);
    }
  }, [manualLang, value, highlightCode]);

  const handleContainerClick = () => {
    if (!isEditing) {
      setIsEditing(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as SupportedLanguage;
    setManualLang(selected);
    setShowLangPicker(false);
  };

  return (
    <div
      className={twMerge(
        "border border-border-primary overflow-hidden flex flex-col relative",
        className,
      )}
      onClick={handleContainerClick}
    >
      {/* Window Header */}
      <div className="flex items-center gap-2 h-10 px-4 border-b border-border-primary shrink-0">
        <span className="size-3 rounded-full bg-accent-red" />
        <span className="size-3 rounded-full bg-accent-amber" />
        <span className="size-3 rounded-full bg-accent-green" />

        {/* Language badge + selector + character counter */}
        <div className="ml-auto flex items-center gap-3">
          {value.trim() && (
            <>
              <span className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">
                {effectiveLang}
              </span>

              {showLangPicker && (
                <select
                  value={manualLang ?? ""}
                  onChange={handleLanguageChange}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-bg-surface border border-border-primary text-text-secondary font-mono text-[10px] rounded px-1.5 py-0.5 outline-none cursor-pointer"
                >
                  <option value="" disabled>
                    select language
                  </option>
                  {SUPPORTED_LANGUAGES.filter((l) => l !== "text").map(
                    (lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ),
                  )}
                </select>
              )}

              {!showLangPicker && !manualLang && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLangPicker(true);
                  }}
                  className="font-mono text-[10px] text-text-tertiary enabled:hover:text-text-secondary transition-colors"
                >
                  change
                </button>
              )}

              <span
                className={twMerge(
                  "font-mono text-[10px] tabular-nums",
                  isOverLimit ? "text-accent-red" : "text-text-tertiary",
                )}
              >
                {value.length}/{MAX_CHARACTERS}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Code Area */}
      <div className="flex flex-1 bg-bg-input overflow-y-auto max-h-[32rem]">
        {/* Line Numbers */}
        <div className="flex flex-col items-end gap-0 py-4 px-3 w-12 border-r border-border-primary bg-bg-surface select-none shrink-0">
          {Array.from({ length: lineCount }, (_, i) => (
            <span
              key={i}
              // biome-ignore lint/suspicious/noArrayIndexKey: line numbers are index-based and never reorder
              className="font-mono text-xs leading-[1.625] text-text-tertiary"
            >
              {i + 1}
            </span>
          ))}
        </div>

        {/* Content Area - Either Textarea or Highlighted HTML */}
        <div className="flex-1 relative min-h-80">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => {
              if (value.trim()) setIsEditing(false);
            }}
            placeholder="// paste your code here..."
            spellCheck={false}
            className={twMerge(
              "absolute inset-0 w-full h-full py-4 px-4 bg-transparent font-mono text-xs leading-[1.625] text-text-primary placeholder:text-text-tertiary outline-none resize-none",
              !isEditing && "opacity-0 pointer-events-none",
            )}
          />

          <div
            className={twMerge(
              "absolute inset-0 w-full h-full py-4 px-4 pointer-events-none",
              isEditing && "opacity-0",
            )}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output is safe HTML
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </div>
      </div>
    </div>
  );
}

export { CodeEditor, MAX_CHARACTERS, type CodeEditorProps };
