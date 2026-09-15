CREATE TABLE "ranking_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"share_id" varchar(20) NOT NULL,
	"title" varchar(100) DEFAULT '私のアニメ・漫画ランキング' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ranking_profiles_share_id_unique" UNIQUE("share_id")
);
--> statement-breakpoint
CREATE TABLE "ranking_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"work_id" integer NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ranking_entries" ADD CONSTRAINT "ranking_entries_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "ranking_entries_user_work_idx" ON "ranking_entries" USING btree ("user_id","work_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "ranking_entries_user_position_idx" ON "ranking_entries" USING btree ("user_id","position");
