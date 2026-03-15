"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import NumberFlow from "@number-flow/react";

export function HomeMetrics() {
  const trpc = useTRPC();
  const { data: stats } = useQuery(
    trpc.metrics.getHomepageStats.queryOptions()
  );

  const totalSubmissions = stats?.totalSubmissions ?? 0;
  const avgScore = stats?.avgScore ?? 0;

  return (
    <div className="flex items-center gap-6 justify-center pt-8">
      <div className="font-mono text-xs text-text-tertiary flex items-center gap-1.5">
        <NumberFlow value={totalSubmissions} />
        <span>codes roasted</span>
      </div>
      <span className="font-mono text-xs text-text-tertiary">·</span>
      <div className="font-mono text-xs text-text-tertiary flex items-center gap-1.5">
        <span>avg score:</span>
        <NumberFlow
          value={avgScore}
          format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
        />
        <span>/10</span>
      </div>
    </div>
  );
}
