ALTER TABLE "comments" ALTER COLUMN "episode_id" DROP NOT NULL;
ALTER TABLE "comments" ADD COLUMN "work_id" integer REFERENCES "works"("id") ON DELETE CASCADE;
