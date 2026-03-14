"use client";

import { useTRPC } from "@/trpc/client";
import NumberFlow from "@number-flow/react";

export function HomeMetrics() {
  const trpc = useTRPC();
  const [stats] = trpc.metrics.getHomepageStats.useSuspenseQuery();

  return (
    <div className="flex items-center gap-6 justify-center pt-8">
      <div className="font-mono text-xs text-text-tertiary flex items-center gap-1.5">
        <NumberFlow value={stats.totalSubmissions} />
        <span>codes roasted</span>
      </div>
      <span className="font-mono text-xs text-text-tertiary">·</span>
      <div className="font-mono text-xs text-text-tertiary flex items-center gap-1.5">
        <span>avg score:</span>
        <NumberFlow
          value={stats.avgScore}
          format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
        />
        <span>/10</span>
      </div>
    </div>
  );
}

export function HomeMetricsSkeleton() {
  return (
    <div className="flex items-center gap-6 justify-center pt-8">
      <div className="font-mono text-xs text-text-tertiary flex items-center gap-1.5">
        <div className="w-8 h-4 bg-border-primary animate-pulse rounded" />
        <span>codes roasted</span>
      </div>
      <span className="font-mono text-xs text-text-tertiary">·</span>
      <div className="font-mono text-xs text-text-tertiary flex items-center gap-1.5">
        <span>avg score:</span>
        <div className="w-6 h-4 bg-border-primary animate-pulse rounded" />
        <span>/10</span>
      </div>
    </div>
  );
}
