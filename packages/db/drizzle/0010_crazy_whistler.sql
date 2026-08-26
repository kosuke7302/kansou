CREATE TYPE "public"."request_status" AS ENUM('pending', 'in_progress', 'added', 'rejected');--> statement-breakpoint
CREATE TABLE "work_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"type" "content_type",
	"note" text,
	"requester_name" varchar(100),
	"status" "request_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
