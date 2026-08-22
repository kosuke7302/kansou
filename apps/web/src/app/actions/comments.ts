"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { comments, episodes, works } from "@kansou/db";
import { eq, and, isNull, sql } from "drizzle-orm";

export type CommentActionState = { error?: string; success?: boolean };

export async function postComment(
  _prev: CommentActionState,
  formData: FormData
): Promise<CommentActionState> {
  const body = formData.get("body");
  const slug = formData.get("slug");
  const episodeNumber = formData.get("episodeNumber");
  const volumeNumber = formData.get("volumeNumber");
  const authorNameRaw = formData.get("authorName");

  if (
    typeof body !== "string" ||
    typeof slug !== "string" ||
    body.trim().length === 0
  ) {
    return { error: "感想を入力してください" };
  }
  if (body.trim().length > 1000) {
    return { error: "1000文字以内で入力してください" };
  }

  const authorName =
    typeof authorNameRaw === "string" && authorNameRaw.trim()
      ? authorNameRaw.trim().slice(0, 100)
      : "名無し";

  const [work] = await db.select().from(works).where(eq(works.slug, slug)).limit(1);
  if (!work) return { error: "作品が見つかりません" };

  let episode;
  if (volumeNumber && !episodeNumber) {
    [episode] = await db
      .select()
      .from(episodes)
      .where(
        and(
          eq(episodes.workId, work.id),
          eq(episodes.volumeNumber, Number(volumeNumber)),
          isNull(episodes.episodeNumber)
        )
      )
      .limit(1);
    if (!episode) return { error: "巻数が見つかりません" };
    revalidatePath(`/works/${slug}/volumes/${volumeNumber}`);
  } else {
    if (typeof episodeNumber !== "string") return { error: "話数を指定してください" };
    [episode] = await db
      .select()
      .from(episodes)
      .where(
        and(
          eq(episodes.workId, work.id),
          eq(episodes.episodeNumber, Number(episodeNumber))
        )
      )
      .limit(1);
    if (!episode) return { error: "話数が見つかりません" };
    revalidatePath(`/works/${slug}/episodes/${episodeNumber}`);
  }

  await db.insert(comments).values({ episodeId: episode.id, body: body.trim(), authorName });
  revalidatePath("/");
  return { success: true };
}

export async function likeComment(commentId: number): Promise<void> {
  await db
    .update(comments)
    .set({ likeCount: sql`${comments.likeCount} + 1` })
    .where(eq(comments.id, commentId));
}
