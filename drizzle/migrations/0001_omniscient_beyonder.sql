ALTER TABLE "roasts" ADD COLUMN "details" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "roasts" ADD COLUMN "fixed_code" text;