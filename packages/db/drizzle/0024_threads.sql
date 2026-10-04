CREATE TABLE "threads" (
	"id" serial PRIMARY KEY NOT NULL,
	"work_id" integer NOT NULL,
	"title" varchar(100) NOT NULL,
	"author_name" varchar(100) DEFAULT '名前未設定' NOT NULL,
	"user_id" text,
	"anon_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "thread_id" integer;
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_thread_id_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE cascade ON UPDATE no action;
