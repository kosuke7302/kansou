ALTER TABLE "work_requests" ADD COLUMN "linked_work_id" integer REFERENCES "works"("id") ON DELETE SET NULL;
