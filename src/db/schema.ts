import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  numeric,
  timestamp,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";

// Define the Postgres Enum for Veridicts at the DB Level as requested
export const verdictEnum = pgEnum("verdict", [
  "needs_serious_help",
  "might_survive",
  "actually_decent",
  "code_god",
]);

export const roasts = pgTable("roasts", {
  id: uuid("id").defaultRandom().primaryKey(),
  codeSnippet: text("code_snippet").notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  linesCount: integer("lines_count").notNull(),
  isRoastMode: boolean("is_roast_mode").default(false).notNull(),

  score: numeric("score", { precision: 3, scale: 1 }).notNull(),
  verdict: verdictEnum("verdict"),
  roastSummary: text("roast_summary").notNull(),
  details: jsonb("details").$type<{ title: string; description: string }[]>().default([]).notNull(),
  fixedCode: text("fixed_code"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
