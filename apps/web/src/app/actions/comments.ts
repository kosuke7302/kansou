"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { comments, episodes, works } from "@kansou/db";
import { eq, and } from "drizzle-orm";

export type CommentActionState = { error?: string; success?: boolean };

export async function postComment(
  _prev: CommentActionState,
  formData: FormData
): Promise<CommentActionState> {
  const body = formData.get("body");
  const slug = formData.get("slug");
  const episodeNumber = formData.get("episodeNumber");

  if (
    typeof body !== "string" ||
    typeof slug !== "string" ||
    typeof episodeNumber !== "string" ||
    body.trim().length === 0
  ) {
    return { error: "感想を入力してください" };
  }

  if (body.trim().length > 1000) {
    return { error: "1000文字以内で入力してください" };
  }

  const [work] = await db.select().from(works).where(eq(works.slug, slug)).limit(1);
  if (!work) return { error: "作品が見つかりません" };

  const [episode] = await db
    .select()
    .from(episodes)
    .where(and(eq(episodes.workId, work.id), eq(episodes.episodeNumber, Number(episodeNumber))))
    .limit(1);
  if (!episode) return { error: "話数が見つかりません" };

  await db.insert(comments).values({ episodeId: episode.id, body: body.trim() });

  revalidatePath(`/works/${slug}/episodes/${episodeNumber}`);
  revalidatePath("/");
  return { success: true };
}
