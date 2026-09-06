CREATE TABLE "episode_add_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"work_id" integer NOT NULL,
	"field" varchar(10) NOT NULL,
	"requested_number" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "episode_add_requests" ADD CONSTRAINT "episode_add_requests_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
