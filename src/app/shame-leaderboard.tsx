import { caller } from "@/trpc/server";
import Link from "next/link";
import { CodeBlock } from "@/components/ui/code-block";
import { CollapsibleCode } from "@/components/ui/collapsible-code";
import type { BundledLanguage } from "shiki";

function scoreColor(score: number): string {
  if (score <= 3) return "text-accent-red";
  if (score <= 6) return "text-accent-amber";
  return "text-accent-green";
}

export async function ShameLeaderboard() {
  const { entries: leaderboard, totalCount } =
    await caller.metrics.getLeaderboard();

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="border border-border-primary w-full overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center h-10 px-5 bg-bg-surface border-b border-border-primary">
          <span className="w-12 font-mono text-xs font-medium text-text-tertiary">
            #
          </span>
          <span className="w-18 font-mono text-xs font-medium text-text-tertiary">
            score
          </span>
          <span className="flex-1 font-mono text-xs font-medium text-text-tertiary">
            code
          </span>
          <span className="w-24 font-mono text-xs font-medium text-text-tertiary text-right">
            lang
          </span>
        </div>

        {/* Table Rows */}
        {leaderboard.map((entry, index) => (
          <div
            key={entry.id}
            className={`flex flex-col px-5 py-4 ${index < leaderboard.length - 1 ? "border-b border-border-primary" : ""}`}
          >
            <div className="flex items-center mb-4">
              <span className="w-12 font-mono text-xs text-accent-amber">
                {index + 1}
              </span>
              <span
                className={`w-18 font-mono text-xs font-bold ${scoreColor(entry.score)}`}
              >
                {entry.score.toFixed(1)}
              </span>
              <span className="flex-1 font-mono text-xs text-text-tertiary italic">
                {"// roast verdict: "}
                {entry.verdict?.replace(/_/g, " ")}
              </span>
              <span className="w-24 font-mono text-xs text-text-secondary text-right">
                {entry.language}
              </span>
            </div>

            <div className="pl-12">
              <CollapsibleCode>
                <CodeBlock
                  code={entry.codeSnippet}
                  lang={entry.language as BundledLanguage}
                  className="border-none"
                />
              </CollapsibleCode>
            </div>
          </div>
        ))}

        {leaderboard.length === 0 && (
          <div className="px-5 py-8 text-center text-text-tertiary font-mono text-xs">
            {"// no roasts yet. be the first to be shamed."}
          </div>
        )}
      </div>

      {/* Fade Hint */}
      <p className="font-mono text-xs text-text-tertiary text-center">
        showing top {leaderboard.length} of {totalCount.toLocaleString()} ·{" "}
        <Link
          href="/leaderboard"
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          view full leaderboard {">>"}
        </Link>
      </p>
    </div>
  );
}

export function ShameLeaderboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse">
      <div className="border border-border-primary w-full">
        {/* Table Header */}
        <div className="flex items-center h-10 px-5 bg-bg-surface border-b border-border-primary">
          <span className="w-12 font-mono text-xs font-medium text-text-tertiary">
            #
          </span>
          <span className="w-18 font-mono text-xs font-medium text-text-tertiary">
            score
          </span>
          <span className="flex-1 font-mono text-xs font-medium text-text-tertiary">
            code
          </span>
          <span className="w-24 font-mono text-xs font-medium text-text-tertiary text-right">
            lang
          </span>
        </div>

        {/* Placeholder Rows */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex px-5 py-4 ${i < 3 ? "border-b border-border-primary" : ""}`}
          >
            <div className="w-12 h-4 bg-border-primary rounded" />
            <div className="w-18 h-4 bg-border-primary rounded ml-4" />
            <div className="flex-1 flex flex-col gap-1 ml-6">
              <div className="w-3/4 h-3 bg-border-primary rounded" />
              <div className="w-1/2 h-3 bg-border-primary rounded" />
            </div>
            <div className="w-24 h-4 bg-border-primary rounded" />
          </div>
        ))}
      </div>

      <div className="h-4 w-64 bg-border-primary rounded self-center" />
    </div>
  );
}
