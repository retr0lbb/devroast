import {
  LeaderboardEntryRoot,
  LeaderboardEntryMeta,
  LeaderboardEntryCode,
} from "@/components/leaderboard-entry";

const entries = [
  {
    rank: 1,
    score: 1.2,
    language: "javascript",
    code: `eval(prompt("enter code"))\ndocument.write(response)\n// trust the user lol`,
  },
  {
    rank: 2,
    score: 1.8,
    language: "typescript",
    code: `if (x == true) { return true; }\nelse if (x == false) { return false; }\nelse { return !false; }`,
  },
  {
    rank: 3,
    score: 2.1,
    language: "sql",
    code: `SELECT * FROM users WHERE 1=1\n-- TODO: add authentication`,
  },
  {
    rank: 4,
    score: 2.3,
    language: "python",
    code: `import os\nos.system("rm -rf /")\n# cleanup script`,
  },
  {
    rank: 5,
    score: 2.5,
    language: "javascript",
    code: `const sleep = (ms) =>\n  new Date(Date.now() + ms)\n  while(new Date() < end) {}`,
  },
];

export default async function LeaderboardPage() {
  const totalSubmissions = "2,847";
  const avgScore = "4.2";

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
            {totalSubmissions} submissions
          </span>
          <span className="font-mono text-xs text-text-tertiary">·</span>
          <span className="font-mono text-xs text-text-tertiary">
            avg score: {avgScore}/10
          </span>
        </div>
      </section>

      {/* Leaderboard Entries */}
      <section className="flex flex-col gap-5">
        {entries.map((entry) => (
          <LeaderboardEntryRoot key={entry.rank}>
            <LeaderboardEntryMeta
              rank={entry.rank}
              score={entry.score}
              language={entry.language}
              linesCount={entry.code.split("\n").length}
            />
            <LeaderboardEntryCode
                code={entry.code}
                lang={entry.language as "javascript" | "typescript" | "sql" | "python"}
              />
          </LeaderboardEntryRoot>
        ))}
      </section>
    </main>
  );
}
