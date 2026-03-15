import {
  LeaderboardEntryRoot,
  LeaderboardEntryMeta,
  LeaderboardEntryCode,
} from "@/components/leaderboard-entry";
import { caller } from "@/trpc/server";
import type { BundledLanguage } from "shiki";
import { unstable_cacheLife as cacheLife } from "next/cache";

export default async function LeaderboardPage() {
  "use cache";
  cacheLife("hours");

  const [stats, leaderboard] = await Promise.all([
    caller.metrics.getHomepageStats(),
    caller.metrics.getLeaderboard({ limit: 20 }),
  ]);

  return (
    <main className="flex flex-col gap-10 px-20 py-10">
      {/* Hero Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[32px] font-bold text-accent-green">
            {">"}
          </span>
          <h1 className="font-mono text-[28px] font-bold text-text-primary">
            shame_leaderboard
          </h1>
        </div>

        <p className="font-mono text-sm text-text-secondary">
          {"// the most roasted code on the internet"}
        </p>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-text-tertiary">
            {stats.totalSubmissions.toLocaleString()} submissions
          </span>
          <span className="font-mono text-xs text-text-tertiary">·</span>
          <span className="font-mono text-xs text-text-tertiary">
            avg score: {stats.avgScore.toFixed(1)}/10
          </span>
        </div>
      </section>

      {/* Leaderboard Entries */}
      <section className="flex flex-col gap-5">
        {leaderboard.entries.map((entry, index) => (
          <LeaderboardEntryRoot key={entry.id}>
            <LeaderboardEntryMeta
              rank={index + 1}
              score={entry.score}
              language={entry.language}
              linesCount={entry.codeSnippet.split("\n").length}
            />
            <LeaderboardEntryCode
              code={entry.codeSnippet}
              lang={entry.language as BundledLanguage}
            />
          </LeaderboardEntryRoot>
        ))}

        {leaderboard.entries.length === 0 && (
          <div className="border border-border-primary p-10 text-center font-mono text-sm text-text-tertiary">
            {"// no entries yet. keep roasting."}
          </div>
        )}
      </section>
    </main>
  );
}
