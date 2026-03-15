import { db } from "@/db";
import { roasts } from "@/db/schema";
import { asc, avg, count } from "drizzle-orm";
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

    getLeaderboard: baseProcedure.query(async () => {
      const [leaderboard, [stats]] = await Promise.all([
        db.select().from(roasts).orderBy(asc(roasts.score)).limit(3),
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
});

export type AppRouter = typeof appRouter;
