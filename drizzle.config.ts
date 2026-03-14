import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import { resolve } from "node:path";

// Carrega .env explícito
config({ path: resolve(process.cwd(), '.env') });
// Caso o usuário use .env.local via Next.js
config({ path: resolve(process.cwd(), '.env.local') });

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql', // Note: drizzle-kit 0.22+ uses `dialect` instead of `driver`
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
