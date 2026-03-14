"use client";

import { twMerge } from "tailwind-merge";
import { useState, useEffect, useRef } from "react";
import hljs from "highlight.js";
import { codeToHtml } from "shiki";

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

// Map highlight.js language names to Shiki language names where they differ
const langMap: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  rb: "ruby",
  cs: "csharp",
  cpp: "cpp",
  c: "c",
  java: "java",
  go: "go",
  rs: "rust",
  php: "php",
  html: "html",
  css: "css",
  json: "json",
  xml: "xml",
  sql: "sql",
  bash: "bash",
  sh: "bash",
  yaml: "yaml",
  yml: "yaml",
  md: "markdown",
};

function CodeEditor({ value, onChange, className }: CodeEditorProps) {
  const [isEditing, setIsEditing] = useState(true);
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const lines = value.split("\n");
  const lineCount = Math.max(lines.length, 16);

  useEffect(() => {
    // If empty, always show the editor
    if (!value.trim()) {
      setIsEditing(true);
      setHighlightedHtml("");
      return;
    }

    const highlightCode = async () => {
      try {
        // Detect language using highlight.js
        const detection = hljs.highlightAuto(value);
        const detectedLang = detection.language || "text";
        const shikiLang = langMap[detectedLang] || detectedLang;

        // Generate highlighted HTML using Shiki
        let html: string;
        try {
          html = await codeToHtml(value, {
            lang: shikiLang,
            theme: "vesper",
          });
        } catch (_) {
          // Se o shiki não suportar a linguagem detectada (ex: wren), fallback para plain text
          html = await codeToHtml(value, {
            lang: "text",
            theme: "vesper",
          });
        }
        
        // Remove the outer <pre> wrapper that shiki adds, as we want to keep it raw for our layout
        // Shiki output format is roughly: <pre class="shiki vesper" style="..."><code>...</code></pre>
        // We extract just the inner HTML of the <code> tag if possible to style it ourselves,
        // or just use the generated HTML directly if it's easier. 
        // For simplicity and to keep the exact vesper theme text colors, we'll keep the shiki HTML
        // but we need to ensure it wraps correctly.
        setHighlightedHtml(html);
        setIsEditing(false); // Switch to preview mode after highlighting
      } catch (error) {
        console.error("Failed to highlight code:", error);
        // Fallback para textarea puro se ocorrer um erro muito grave
        setIsEditing(true); 
      }
    };

    // Debounce the highlighting slightly so it doesn't run on every single keystroke if the user is typing
    const timeoutId = setTimeout(() => {
        highlightCode();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [value]);

  const handleContainerClick = () => {
    if (!isEditing) {
      setIsEditing(true);
      // Focus the textarea after state update using a small timeout
      setTimeout(() => {
         inputRef.current?.focus();
      }, 0);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
     // Optional: You could trigger highlighting immediately on paste here
     // but the useEffect with debounce handles it well enough.
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
      </div>

      {/* Code Area */}
      <div className="flex flex-1 bg-bg-input overflow-y-auto">
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
            onPaste={handlePaste}
            onBlur={() => {
                if(value.trim()) setIsEditing(false);
            }}
            placeholder="// paste your code here..."
            spellCheck={false}
            className={twMerge(
              "absolute inset-0 w-full h-full py-4 px-4 bg-transparent font-mono text-xs leading-[1.625] text-text-primary placeholder:text-text-tertiary outline-none resize-none",
              !isEditing && "opacity-0 pointer-events-none" // Hide textarea when not editing, but keep it in DOM for value
            )}
            style={{
                // Ensure textarea text aligns perfectly with the highlighted text if we were doing overlay
                // For mode-switching, we just hide it.
            }}
          />
          
          <div 
             className={twMerge(
                 "absolute inset-0 w-full h-full py-4 px-4 overflow-auto pointer-events-none",
                 isEditing && "opacity-0"
             )}
             // We use dangerouslySetInnerHTML to render the HTML returned by Shiki
             // Note: in a real app, ensure you sanitize if the input is untrusted,
             // but here the code is just strings rendered by shiki.
             // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output is safe HTML
             dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </div>
      </div>
    </div>
  );
}

export { CodeEditor, type CodeEditorProps };
