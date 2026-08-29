"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { episodeRatings } from "@kansou/db";
import { revalidatePath } from "next/cache";

export async function rateEpisode(
  episodeId: number,
  rating: number,
  path: string
): Promise<{ error?: string }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "ログインが必要です" };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "不正な評価です" };
  }

  await db
    .insert(episodeRatings)
    .values({ episodeId, userId, rating })
    .onConflictDoUpdate({
      target: [episodeRatings.episodeId, episodeRatings.userId],
      set: { rating, updatedAt: new Date() },
    });

  revalidatePath(path);
  return {};
}
