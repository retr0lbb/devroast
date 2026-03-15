import { db } from "@/db";
import { roasts } from "@/db/schema";
import { asc, avg, count, eq } from "drizzle-orm";
import { z } from "zod";
import { generateRoast } from "@/lib/gemini";
import { baseProcedure, createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  metrics: createTRPCRouter({
    getHomepageStats: baseProcedure.query(async () => {
      const [stats] = await db
        .select({
          totalSubmissions: count(),
          avgScore: avg(roasts.score),
        })
        .from(roasts);

      return {
        totalSubmissions: Number(stats?.totalSubmissions ?? 0),
        avgScore: Number(stats?.avgScore ?? 0),
      };
    }),

    getLeaderboard: baseProcedure
      .input(
        z
          .object({
            limit: z.number().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const limit = input?.limit ?? 3;

        const [leaderboard, [stats]] = await Promise.all([
          db.select().from(roasts).orderBy(asc(roasts.score)).limit(limit),
          db.select({ total: count() }).from(roasts),
        ]);

        return {
          entries: leaderboard.map((roast) => ({
            ...roast,
            score: Number(roast.score),
          })),
          totalCount: Number(stats?.total ?? 0),
        };
      }),
  }),

  roasts: createTRPCRouter({
    createRoast: baseProcedure
      .input(
        z.object({
          codeSnippet: z.string().min(1),
          isRoastMode: z.boolean(),
        })
      )
      .mutation(async ({ input }) => {
        const { codeSnippet, isRoastMode } = input;

        // Generate roast via Gemini
        const result = await generateRoast(codeSnippet, isRoastMode);

        // Save to DB
        const [newRoast] = await db
          .insert(roasts)
          .values({
            codeSnippet,
            language: result.language,
            linesCount: codeSnippet.split("\n").length,
            isRoastMode,
            score: result.score.toString(),
            verdict: result.verdict,
            roastSummary: result.roastSummary,
            fixedCode: result.fixedCode,
          })
          .returning({ id: roasts.id });

        return { id: newRoast.id };
      }),

    getRoastById: baseProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ input }) => {
        const [roast] = await db
          .select()
          .from(roasts)
          .where(eq(roasts.id, input.id));

        if (!roast) return null;

        return {
          ...roast,
          score: Number(roast.score),
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
