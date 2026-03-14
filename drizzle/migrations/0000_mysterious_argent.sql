CREATE TYPE "public"."verdict" AS ENUM('needs_serious_help', 'might_survive', 'actually_decent', 'code_god');--> statement-breakpoint
CREATE TABLE "roasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code_snippet" text NOT NULL,
	"language" varchar(50) NOT NULL,
	"lines_count" integer NOT NULL,
	"is_roast_mode" boolean DEFAULT false NOT NULL,
	"score" numeric(3, 1) NOT NULL,
	"verdict" "verdict",
	"roast_summary" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
