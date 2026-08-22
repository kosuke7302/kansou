import { pgTable, serial, text, varchar, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const contentTypeEnum = pgEnum("content_type", [
  "manga",
  "anime",
  "drama",
  "movie",
]);

export const works = pgTable("works", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  type: contentTypeEnum("type").notNull(),
  description: text("description"),
  thumbnailUrl: varchar("thumbnail_url", { length: 512 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const episodes = pgTable("episodes", {
  id: serial("id").primaryKey(),
  workId: integer("work_id")
    .references(() => works.id, { onDelete: "cascade" })
    .notNull(),
  episodeNumber: integer("episode_number").notNull(),
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  episodeId: integer("episode_id")
    .references(() => episodes.id, { onDelete: "cascade" })
    .notNull(),
  body: text("body").notNull(),
  authorName: varchar("author_name", { length: 100 }).notNull().default("名無し"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Work = typeof works.$inferSelect;
export type NewWork = typeof works.$inferInsert;
export type Episode = typeof episodes.$inferSelect;
export type NewEpisode = typeof episodes.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
