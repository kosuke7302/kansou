"use server";

import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { episodeRatings } from "@kansou/db";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

const ANON_ID_COOKIE = "kansou_anon_id";

// ログイン済みならGoogleアカウントの安定ID、未ログインならCookieで発行した匿名IDを評価の識別子として使う
async function resolveRatingUserId(): Promise<string> {
  const session = await auth();
  if (session?.user?.id) return session.user.id;

  const jar = await cookies();
  const existing = jar.get(ANON_ID_COOKIE)?.value;
  if (existing) return `anon:${existing}`;

  const anonId = randomUUID();
  jar.set(ANON_ID_COOKIE, anonId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return `anon:${anonId}`;
}

export async function rateEpisode(
  episodeId: number,
  rating: number,
  path: string
): Promise<{ error?: string }> {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "不正な評価です" };
  }
  const userId = await resolveRatingUserId();

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

export async function getMyRating(episodeId: number): Promise<number | null> {
  const session = await auth();
  const jar = await cookies();
  const anonId = jar.get(ANON_ID_COOKIE)?.value;
  const userId = session?.user?.id ?? (anonId ? `anon:${anonId}` : null);
  if (!userId) return null;

  const [row] = await db
    .select({ rating: episodeRatings.rating })
    .from(episodeRatings)
    .where(and(eq(episodeRatings.episodeId, episodeId), eq(episodeRatings.userId, userId)))
    .limit(1);
  return row?.rating ?? null;
}
