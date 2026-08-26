CREATE TABLE "user_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"nickname" varchar(100),
	"updated_at" timestamp DEFAULT now() NOT NULL
);
