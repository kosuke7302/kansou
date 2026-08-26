import { pgTable, serial, text, varchar, integer, timestamp, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";

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
  platform: varchar("platform", { length: 50 }), // "netflix" | "amazon_prime" | "disney_plus"
  description: text("description"),
  keywords: text("keywords"), // 検索用キーワード（スペース区切り）
  thumbnailUrl: varchar("thumbnail_url", { length: 512 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const episodes = pgTable("episodes", {
  id: serial("id").primaryKey(),
  workId: integer("work_id")
    .references(() => works.id, { onDelete: "cascade" })
    .notNull(),
  episodeNumber: integer("episode_number"),
  volumeNumber: integer("volume_number"),
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  episodeId: integer("episode_id")
    .references(() => episodes.id, { onDelete: "cascade" }),
  workId: integer("work_id")
    .references(() => works.id, { onDelete: "cascade" }),
  userId: text("user_id"), // Googleアカウントの安定ID（account.providerAccountId）。匿名投稿はnull
  body: text("body").notNull(),
  authorName: varchar("author_name", { length: 100 }).notNull().default("名無し"),
  likeCount: integer("like_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  workId: integer("work_id")
    .references(() => works.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  uniqueIndex("favorites_user_work_idx").on(t.userId, t.workId),
]);

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Work = typeof works.$inferSelect;
export type NewWork = typeof works.$inferInsert;
export type Episode = typeof episodes.$inferSelect;
export type NewEpisode = typeof episodes.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
