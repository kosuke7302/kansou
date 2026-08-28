CREATE TYPE "public"."reaction_type" AS ENUM('cry', 'laugh', 'shock', 'hype', 'angry');--> statement-breakpoint
CREATE TABLE "episode_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"episode_id" integer NOT NULL,
	"type" "reaction_type" NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "episode_reactions" ADD CONSTRAINT "episode_reactions_episode_id_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."episodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "episode_reactions_episode_type_idx" ON "episode_reactions" USING btree ("episode_id","type");