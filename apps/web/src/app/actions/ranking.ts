"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rankingEntries, rankingProfiles, works } from "@kansou/db";
import { eq, asc } from "drizzle-orm";

const MAX_ENTRIES = 5;

export type MyRankingEntry = {
  workId: number;
  slug: string;
  title: string;
  type: string;
  position: number;
};

export async function getMyRanking(): Promise<MyRankingEntry[]> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  const rows = await db
    .select({
      workId: rankingEntries.workId,
      position: rankingEntries.position,
      slug: works.slug,
      title: works.title,
      type: works.type,
    })
    .from(rankingEntries)
    .innerJoin(works, eq(works.id, rankingEntries.workId))
    .where(eq(rankingEntries.userId, userId))
    .orderBy(asc(rankingEntries.position));

  return rows;
}

// workIdsは順位順（先頭が1位）。最大5件、既存の並びを丸ごと置き換える
export async function saveMyRanking(workIds: number[]): Promise<{ error?: string; shareId?: string }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "ログインが必要です" };

  const uniqueIds = Array.from(new Set(workIds)).slice(0, MAX_ENTRIES);
  if (uniqueIds.length === 0) return { error: "作品を1つ以上選んでください" };

  // neon-httpドライバはトランザクション非対応のため逐次実行。delete→insertの間の
  // 一瞬の空白は許容（他ユーザーには影響せず、本人が再読み込みしても実害はない）
  await db
    .insert(rankingProfiles)
    .values({ userId, shareId: randomBytes(6).toString("base64url") })
    .onConflictDoNothing({ target: rankingProfiles.userId });

  await db.delete(rankingEntries).where(eq(rankingEntries.userId, userId));
  await db.insert(rankingEntries).values(
    uniqueIds.map((workId, i) => ({ userId, workId, position: i + 1 }))
  );

  const [profile] = await db
    .select({ shareId: rankingProfiles.shareId })
    .from(rankingProfiles)
    .where(eq(rankingProfiles.userId, userId))
    .limit(1);

  revalidatePath("/my-ranking");
  return { shareId: profile?.shareId };
}

export async function getMyShareId(): Promise<string | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const [row] = await db
    .select({ shareId: rankingProfiles.shareId })
    .from(rankingProfiles)
    .where(eq(rankingProfiles.userId, userId))
    .limit(1);
  return row?.shareId ?? null;
}
