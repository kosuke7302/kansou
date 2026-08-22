CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255),
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
