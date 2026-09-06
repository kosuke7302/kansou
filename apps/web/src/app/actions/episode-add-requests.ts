"use server";

import { db } from "@/lib/db";
import { episodeAddRequests, works } from "@kansou/db";
import { eq } from "drizzle-orm";

/**
 * 話数/巻ページで「次の話がない」場合のワンクリックリクエスト。
 * ログイン不要・匿名。連打防止はクライアント側のlocalStorageで行う（サーバー側では重複排除しない）。
 */
export async function requestNextEpisode(
  workId: number,
  field: "episode" | "volume",
  requestedNumber: number
): Promise<{ error?: string; success?: boolean }> {
  if (!Number.isInteger(workId) || workId < 1) return { error: "不正なリクエストです" };
  if (field !== "episode" && field !== "volume") return { error: "不正なリクエストです" };
  if (!Number.isInteger(requestedNumber) || requestedNumber < 1) return { error: "不正なリクエストです" };

  const [work] = await db.select({ id: works.id }).from(works).where(eq(works.id, workId)).limit(1);
  if (!work) return { error: "作品が見つかりません" };

  await db.insert(episodeAddRequests).values({ workId, field, requestedNumber });
  return { success: true };
}
