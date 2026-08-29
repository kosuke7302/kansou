ALTER TABLE "works" RENAME COLUMN "platform" TO "platforms";--> statement-breakpoint
ALTER TABLE "works" ALTER COLUMN "platforms" TYPE varchar(50)[] USING (
  CASE WHEN "platforms" IS NULL THEN NULL ELSE ARRAY["platforms"]::varchar(50)[] END
);
