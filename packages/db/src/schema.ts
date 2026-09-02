import { pgTable, serial, text, varchar, integer, timestamp, boolean, jsonb, pgEnum, uniqueIndex, type AnyPgColumn } from "drizzle-orm/pg-core";

export const contentTypeEnum = pgEnum("content_type", [
  "manga",
  "anime",
  "drama",
  "movie",
]);

export const requestStatusEnum = pgEnum("request_status", [
  "pending",
  "in_progress",
  "added",
  "rejected",
]);

export const reactionTypeEnum = pgEnum("reaction_type", [
  "cry",
  "laugh",
  "shock",
  "hype",
  "angry",
]);

export const works = pgTable("works", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  type: contentTypeEnum("type").notNull(),
  platforms: varchar("platforms", { length: 50 }).array(), // ["netflix", "amazon_prime", ...]
  platformsUpdatedAt: timestamp("platforms_updated_at"), // 配信タグを最後に変更した日時（陳腐化チェック用）
  fromRequest: boolean("from_request").default(false).notNull(), // ユーザーリクエストがきっかけで追加した作品か
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
  parentId: integer("parent_id")
    .references((): AnyPgColumn => comments.id, { onDelete: "cascade" }),
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

export const episodeReactions = pgTable("episode_reactions", {
  id: serial("id").primaryKey(),
  episodeId: integer("episode_id")
    .references(() => episodes.id, { onDelete: "cascade" })
    .notNull(),
  type: reactionTypeEnum("type").notNull(),
  count: integer("count").default(0).notNull(),
}, (t) => [
  uniqueIndex("episode_reactions_episode_type_idx").on(t.episodeId, t.type),
]);

export const episodeRatings = pgTable("episode_ratings", {
  id: serial("id").primaryKey(),
  episodeId: integer("episode_id")
    .references(() => episodes.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id").notNull(),
  rating: integer("rating").notNull(), // 1〜5
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  uniqueIndex("episode_ratings_episode_user_idx").on(t.episodeId, t.userId),
]);

export const userProfiles = pgTable("user_profiles", {
  userId: text("user_id").primaryKey(),
  nickname: varchar("nickname", { length: 100 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workRequests = pgTable("work_requests", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  type: contentTypeEnum("type"),
  note: text("note"),
  requesterName: varchar("requester_name", { length: 100 }),
  status: requestStatusEnum("status").notNull().default("pending"),
  linkedWorkId: integer("linked_work_id").references(() => works.id, { onDelete: "set null" }), // 追加済み作品への直接リンク（一覧からワンクリック遷移用）
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// GA4 Data APIから定期取得した集計結果のキャッシュ（1日1回バッチ更新、ページ本体はISRのまま毎回叩かない）
export const analyticsCache = pgTable("analytics_cache", {
  key: varchar("key", { length: 50 }).primaryKey(), // "monthly_pageviews" | "top_pages_7d" など
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type WorkRequest = typeof workRequests.$inferSelect;
export type NewWorkRequest = typeof workRequests.$inferInsert;
export type EpisodeReaction = typeof episodeReactions.$inferSelect;
export type NewEpisodeReaction = typeof episodeReactions.$inferInsert;
export type EpisodeRating = typeof episodeRatings.$inferSelect;
export type NewEpisodeRating = typeof episodeRatings.$inferInsert;
