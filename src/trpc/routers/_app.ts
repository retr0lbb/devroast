import { baseProcedure, createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  metrics: createTRPCRouter({
    getHomepageStats: baseProcedure.query(async () => {
      // For now, returning realistic mock data to wire up the frontend.
      // We will integrate this with Drizzle later.
      return {
        totalSubmissions: 2847,
        avgScore: 4.2,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
