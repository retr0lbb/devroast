import Link from "next/link";
import { ScoreRing } from "@/components/ui/score-ring";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import {
  AnalysisCardRoot,
  AnalysisCardTitle,
  AnalysisCardDescription,
} from "@/components/ui/analysis-card";
import { DiffLine } from "@/components/ui/diff-line";

export default function RoastResultsPage() {
  // Static mock data based on design file Screen 2
  const roast = {
    score: 3.5,
    verdict: "needs_serious_help",
    summary: `"this code looks like it was written during a power outage... in 2005."`,
    language: "javascript",
    linesCount: 7,
    submittedCode: `function calculateTotal(items) {
  var total = 0;
  for(var i = 0; i < items.length; i++) {
    var discount = 0.1;
    if (items[i].promo) {
      discount = 0.2;
    }
    
    console.log("discount applied");
    total = total * 0.9;
  }
 
  // TODO: handle tax calculation
  // TODO: handle currency conversion
 
  return total;
}`,
    issues: [
      {
        type: "critical" as const,
        title: "using var instead of const/let",
        description:
          "var is function-scoped and leads to hoisting bugs. use const by default, let when reassignment is needed.",
      },
      {
        type: "warning" as const,
        title: "imperative loop pattern",
        description:
          "for loops are verbose and error-prone. use .reduce() or .map() for cleaner, functional transformations.",
      },
      {
        type: "good" as const,
        title: "clear naming conventions",
        description:
          "calculateTotal and items are descriptive, self-documenting names that communicate intent without comments.",
      },
      {
        type: "good" as const,
        title: "single responsibility",
        description:
          "the function does one thing well — calculates a total. no side effects, no mixed concerns, no hidden complexity.",
      },
    ],
    diff: [
      { type: "context" as const, content: "  " },
      { type: "removed" as const, content: "function calculateTotal(items) {" },
      {
        type: "added" as const,
        content: "const calculateTotal = (items) => {",
      },
      { type: "removed" as const, content: "  var total = 0;" },
      {
        type: "removed" as const,
        content: "  for(var i = 0; i < items.length; i++) {",
      },
      { type: "removed" as const, content: "    var discount = 0.1;" },
      { type: "removed" as const, content: "    if (items[i].promo) {" },
      { type: "removed" as const, content: "      discount = 0.2;" },
      { type: "removed" as const, content: "    }" },
      { type: "removed" as const, content: "    console.log('discount applied');" },
      { type: "removed" as const, content: "    total = total * 0.9;" },
      { type: "removed" as const, content: "  }" },
      {
        type: "added" as const,
        content: "  return items.reduce((total, item) => {",
      },
      {
        type: "added" as const,
        content: "    const discount = item.promo ? 0.2 : 0.1;",
      },
      { type: "added" as const, content: "    return total * (1 - discount);" },
      { type: "added" as const, content: "  }, 0);" },
      { type: "context" as const, content: "}" },
    ],
  };

  return (
    <main className="flex flex-col gap-10 px-20 py-10 w-full max-w-5xl mx-auto">
      {/* Score Hero Section */}
      <section className="flex items-center gap-12 w-full">
        <ScoreRing score={roast.score} />

        <div className="flex flex-col gap-4 flex-1">
          <Badge variant="critical">verdict: {roast.verdict}</Badge>

          <p className="font-mono text-xl text-text-primary leading-relaxed">
            {roast.summary}
          </p>

          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-text-tertiary">
              lang: {roast.language}
            </span>
            <span className="font-mono text-xs text-text-tertiary">·</span>
            <span className="font-mono text-xs text-text-tertiary">
              {roast.linesCount} lines
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 border border-border-primary text-text-primary font-mono text-xs hover:bg-bg-elevated transition-colors"
            >
              $ share_roast
            </button>
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-border-primary" />

      {/* Submitted Code Section */}
      <section className="flex flex-col gap-4 w-full">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-accent-green">
            {"//"}
          </span>
          <span className="font-mono text-sm font-bold text-text-primary">
            your_submission
          </span>
        </div>

        <div className="w-full">
          <CodeBlock code={roast.submittedCode} lang="javascript" />
        </div>
      </section>

      <div className="h-px w-full bg-border-primary" />

      {/* Analysis Section */}
      <section className="flex flex-col gap-6 w-full">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-accent-green">
            {"//"}
          </span>
          <span className="font-mono text-sm font-bold text-text-primary">
            detailed_analysis
          </span>
        </div>

        <div className="grid grid-cols-2 gap-5 w-full">
          {roast.issues.map((issue, idx) => (
            <AnalysisCardRoot key={idx}>
              <Badge variant={issue.type}>{issue.type}</Badge>
              <AnalysisCardTitle>{issue.title}</AnalysisCardTitle>
              <AnalysisCardDescription>{issue.description}</AnalysisCardDescription>
            </AnalysisCardRoot>
          ))}
        </div>
      </section>

      <div className="h-px w-full bg-border-primary" />

      {/* Diff Section */}
      <section className="flex flex-col gap-6 w-full pb-10">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-accent-green">
            {"//"}
          </span>
          <span className="font-mono text-sm font-bold text-text-primary">
            suggested_fix
          </span>
        </div>

        <div className="flex flex-col border border-border-primary bg-bg-input">
          <div className="flex items-center h-10 px-4 gap-2 border-b border-border-primary">
            <span className="font-mono text-xs font-medium text-text-secondary">
              your_code.ts → improved_code.ts
            </span>
          </div>
          <div className="flex flex-col py-1 overflow-x-auto">
            {roast.diff.map((line, idx) => (
              <DiffLine key={idx} type={line.type}>
                {line.content}
              </DiffLine>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
