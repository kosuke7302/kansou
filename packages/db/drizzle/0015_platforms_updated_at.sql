ALTER TABLE "works" ADD COLUMN "platforms_updated_at" timestamp;--> statement-breakpoint
UPDATE "works" SET "platforms_updated_at" = "created_at" WHERE "platforms" IS NOT NULL;
