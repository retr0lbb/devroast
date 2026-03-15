"use client";

import { type ReactNode, useState } from "react";
import { twMerge } from "tailwind-merge";

type CollapsibleCodeProps = {
  children: ReactNode;
  maxHeight?: string;
};

export function CollapsibleCode({
  children,
  maxHeight = "120px",
}: CollapsibleCodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative group/collapsible">
      <div
        className={twMerge(
          "transition-[max-height] duration-500 ease-in-out relative overflow-hidden",
          isExpanded ? "max-h-none" : ""
        )}
        style={{ maxHeight: isExpanded ? "none" : maxHeight }}
      >
        {children}

        {/* Gradient Fade */}
        {!isExpanded && (
          <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-bg-surface to-transparent pointer-events-none" />
        )}
      </div>

      {/* Expand/Collapse Button */}
      <div className="flex justify-center mt-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="font-mono text-[11px] text-text-tertiary hover:text-text-primary px-3 py-1 bg-bg-surface border border-border-primary hover:border-text-tertiary transition-all"
        >
          {isExpanded ? "$ cd .." : `$ cat full_code`}
        </button>
      </div>
    </div>
  );
}
