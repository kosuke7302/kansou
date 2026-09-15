ALTER TABLE "comments" ADD COLUMN "anon_id" text;
--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "is_first_comment" boolean DEFAULT false NOT NULL;
