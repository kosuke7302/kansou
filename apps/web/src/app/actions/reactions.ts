"use server";

import { db } from "@/lib/db";
import { episodeReactions } from "@kansou/db";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { REACTION_TYPES, type ReactionType } from "@/lib/reaction-types";

export async function addReaction(
  episodeId: number,
  type: ReactionType,
  path: string
): Promise<{ error?: string }> {
  if (!REACTION_TYPES.includes(type)) return { error: "不正なリアクションです" };

  await db
    .insert(episodeReactions)
    .values({ episodeId, type, count: 1 })
    .onConflictDoUpdate({
      target: [episodeReactions.episodeId, episodeReactions.type],
      set: { count: sql`${episodeReactions.count} + 1` },
    });

  revalidatePath(path);
  return {};
}

export async function removeReaction(
  episodeId: number,
  type: ReactionType,
  path: string
): Promise<{ error?: string }> {
  if (!REACTION_TYPES.includes(type)) return { error: "不正なリアクションです" };

  await db
    .update(episodeReactions)
    .set({ count: sql`GREATEST(${episodeReactions.count} - 1, 0)` })
    .where(and(eq(episodeReactions.episodeId, episodeId), eq(episodeReactions.type, type)));

  revalidatePath(path);
  return {};
}
