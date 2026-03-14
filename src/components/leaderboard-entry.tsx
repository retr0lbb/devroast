import type { ComponentProps } from "react";
import type { BundledLanguage } from "shiki";
import { tv } from "tailwind-variants";
import { CodeBlock } from "@/components/ui/code-block";

const leaderboardEntry = tv({
  base: "border border-border-primary w-full",
});

type LeaderboardEntryRootProps = ComponentProps<"div">;

function LeaderboardEntryRoot({
  className,
  ...props
}: LeaderboardEntryRootProps) {
  return <div className={leaderboardEntry({ className })} {...props} />;
}

function scoreColor(score: number): string {
  if (score <= 3) return "text-accent-red";
  if (score <= 6) return "text-accent-amber";
  return "text-accent-green";
}

type LeaderboardEntryMetaProps = ComponentProps<"div"> & {
  rank: number;
  score: number;
  language: string;
  linesCount: number;
};

function LeaderboardEntryMeta({
  rank,
  score,
  language,
  linesCount,
  className,
  ...props
}: LeaderboardEntryMetaProps) {
  return (
    <div
      className={tv({
        base: "flex items-center justify-between h-12 px-5 border-b border-border-primary",
      })({ className })}
      {...props}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs text-text-tertiary">#</span>
          <span className="font-mono text-sm font-bold text-accent-amber">
            {rank}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs text-text-tertiary">score</span>
          <span className={`font-mono text-sm font-bold ${scoreColor(score)}`}>
            {score.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-text-secondary">
          {language}
        </span>
        <span className="font-mono text-xs text-text-tertiary">
          {linesCount} {linesCount === 1 ? "line" : "lines"}
        </span>
      </div>
    </div>
  );
}

type LeaderboardEntryCodeProps = {
  code: string;
  lang: BundledLanguage;
  className?: string;
};

async function LeaderboardEntryCode({
  code,
  lang,
  className,
}: LeaderboardEntryCodeProps) {
  return (
    <div
      className={tv({
        base: "overflow-hidden pb-4",
      })({ className })}
    >
      <CodeBlock code={code} lang={lang} />
    </div>
  );
}

export {
  LeaderboardEntryRoot,
  LeaderboardEntryMeta,
  LeaderboardEntryCode,
  leaderboardEntry,
  type LeaderboardEntryRootProps,
  type LeaderboardEntryMetaProps,
  type LeaderboardEntryCodeProps,
};
