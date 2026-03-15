import { caller } from "@/trpc/server";
import { notFound } from "next/navigation";
import { ScoreRing } from "@/components/ui/score-ring";
import { CodeBlock } from "@/components/ui/code-block";
import { AnalysisCardRoot, AnalysisCardTitle, AnalysisCardDescription } from "@/components/ui/analysis-card";
import { Badge } from "@/components/ui/badge";
import type { BundledLanguage } from "shiki";
import Link from "next/link";
import { ShareRoastButton } from "@/components/share-button";
import type { Metadata } from "next";

interface RoastPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: RoastPageProps): Promise<Metadata> {
  const { id } = await params;
  const roast = await caller.roasts.getRoastById({ id });

  if (!roast) return { title: "Roast Not Found | DevRoast" };

  return {
    title: `Roast Veredict: ${roast.verdict?.replace(/_/g, " ").toUpperCase()} | DevRoast`,
    description: roast.roastSummary,
    openGraph: {
      title: "DevRoast - Code Analysis",
      description: roast.roastSummary,
      type: "website",
    },
  };
}

const VERDICT_COLORS = {
  needs_serious_help: "text-accent-red",
  might_survive: "text-accent-amber",
  actually_decent: "text-accent-green",
  code_god: "text-accent-green",
};

export default async function RoastPage({ params }: RoastPageProps) {
  const { id } = await params;
  const roast = await caller.roasts.getRoastById({ id });

  if (!roast) {
    notFound();
  }

  return (
    <main className="flex flex-col gap-12 px-20 py-12 max-w-6xl mx-auto">
      {/* Header with Score and Verdict */}
      <section className="flex items-center justify-between gap-12">
        <div className="flex items-center gap-12">
          <ScoreRing score={roast.score} />

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-bold text-accent-green">{">"}</span>
              <h1 className="font-mono text-3xl font-bold text-text-primary uppercase tracking-tight">
                roast_results
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="good" className="font-mono uppercase px-3 py-1">
                {roast.language}
              </Badge>
              <span className="text-text-tertiary">|</span>
              <span className={`font-mono text-xl font-bold uppercase ${VERDICT_COLORS[roast.verdict!]}`}>
                {roast.verdict?.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>

        <ShareRoastButton roastId={id} summary={roast.roastSummary} />
      </section>

      {/* Analysis and Summary */}
      <section className="flex flex-col gap-6">
        <AnalysisCardRoot className="bg-bg-input border-accent-amber/20">
          <AnalysisCardTitle className="flex items-center gap-2">
            <span className="text-accent-amber">{"//"}</span> THE_VERDICT
          </AnalysisCardTitle>
          <AnalysisCardDescription className="text-lg italic font-bold text-text-primary leading-relaxed whitespace-pre-wrap">
            "{roast.roastSummary}"
          </AnalysisCardDescription>
        </AnalysisCardRoot>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roast.details.map((detail, index) => (
            <AnalysisCardRoot key={`${detail.title}-${index}`}>
              <AnalysisCardTitle className="text-accent-green uppercase tracking-tighter text-[11px] mb-1">
                {detail.title}
              </AnalysisCardTitle>
              <AnalysisCardDescription className="text-xs text-text-secondary">
                {detail.description}
              </AnalysisCardDescription>
            </AnalysisCardRoot>
          ))}

          {/* Metrics Card */}
          <AnalysisCardRoot className="border-dashed">
            <AnalysisCardTitle className="flex items-center gap-2">
              <span className="text-text-tertiary">{"//"}</span> METRICS
            </AnalysisCardTitle>
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex justify-between font-mono text-[10px]">
                <span className="text-text-tertiary">lines:</span>
                <span className="text-text-primary">{roast.linesCount}</span>
              </div>
              <div className="flex justify-between font-mono text-[10px]">
                <span className="text-text-tertiary">mode:</span>
                <span className={roast.isRoastMode ? "text-accent-red" : "text-text-primary"}>
                  {roast.isRoastMode ? "roast_mode" : "standard"}
                </span>
              </div>
            </div>
          </AnalysisCardRoot>
        </div>
      </section>

      {/* Code Comparison */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-lg font-bold text-text-primary flex items-center gap-2">
            <span className="text-accent-green">{"$"}</span> code_evolution
          </h2>
          <span className="font-mono text-xs text-text-tertiary italic">
            {"// if you're smart you'll use the fixed version"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs text-text-tertiary uppercase">Original garbage:</span>
            <CodeBlock
              code={roast.codeSnippet}
              lang={roast.language as BundledLanguage}
              className="max-h-[500px]"
            />
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs text-accent-green uppercase font-bold">The Fix:</span>
            <CodeBlock
              code={roast.fixedCode || "// AI was too stunned to suggest a fix"}
              lang={roast.language as BundledLanguage}
              className="max-h-[500px] border-accent-green/30"
            />
          </div>
        </div>
      </section>

      {/* Footer Actions */}
      <section className="flex justify-center pt-8 border-t border-border-primary">
        <Link
          href="/"
          className="font-mono text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
        >
          {"<< submit more trash"}
        </Link>
      </section>
    </main>
  );
}
