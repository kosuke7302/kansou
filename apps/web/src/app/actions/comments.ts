"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { comments, episodes, works } from "@kansou/db";
import { eq, and, isNull, sql, count } from "drizzle-orm";
import { auth } from "@/auth";
import { getOrCreateAnonId } from "@/lib/anon-id";

export type CommentActionState = { error?: string; success?: boolean; isFirstComment?: boolean };

// ログイン済みならGoogleアカウントID、未ログインならCookieの匿名IDで投稿者を識別し、
// この投稿がその識別子にとって初めての投稿かどうかを判定する（初コメントバッジ用）
async function resolveCommentIdentity(): Promise<{ userId: string | null; anonId: string | null; isFirstComment: boolean }> {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const anonId = userId ? null : await getOrCreateAnonId();

  const [{ priorCount }] = await db
    .select({ priorCount: count() })
    .from(comments)
    .where(userId ? eq(comments.userId, userId) : eq(comments.anonId, anonId!));

  return { userId, anonId, isFirstComment: Number(priorCount) === 0 };
}

// クライアントはVercel Blobへの直アップロード後のURLしか送ってこない想定だが、
// hidden inputは書き換え可能なため、実際にBlobストレージのURLかをサーバー側でも検証する
function sanitizeImageUrl(raw: FormDataEntryValue | null): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || !url.hostname.endsWith(".public.blob.vercel-storage.com")) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

async function checkAdminAuth() {
  const jar = await cookies();
  return jar.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

export async function postComment(
  _prev: CommentActionState,
  formData: FormData
): Promise<CommentActionState> {
  const body = formData.get("body");
  const slug = formData.get("slug");
  const episodeNumber = formData.get("episodeNumber");
  const volumeNumber = formData.get("volumeNumber");
  const authorNameRaw = formData.get("authorName");
  const parentIdRaw = formData.get("parentId");

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
      : "名前未設定";

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

  const parentId =
    typeof parentIdRaw === "string" && parentIdRaw.trim() ? Number(parentIdRaw) : null;
  if (parentId !== null) {
    const [parent] = await db
      .select({ id: comments.id })
      .from(comments)
      .where(and(eq(comments.id, parentId), eq(comments.episodeId, episode.id)))
      .limit(1);
    if (!parent) return { error: "返信先のコメントが見つかりません" };
  }

  const imageUrl = sanitizeImageUrl(formData.get("imageUrl"));

  const isOfficial = await checkAdminAuth();
  const { userId, anonId, isFirstComment } = await resolveCommentIdentity();
  await db.insert(comments).values({
    episodeId: episode.id,
    parentId,
    body: body.trim(),
    imageUrl,
    authorName,
    userId,
    anonId,
    isOfficial,
    isFirstComment,
  });
  revalidatePath("/");
  return { success: true, isFirstComment };
}

export async function postWorkComment(
  _prev: CommentActionState,
  formData: FormData
): Promise<CommentActionState> {
  const body = formData.get("body");
  const slug = formData.get("slug");
  const authorNameRaw = formData.get("authorName");
  const parentIdRaw = formData.get("parentId");

  if (typeof body !== "string" || typeof slug !== "string" || body.trim().length === 0) {
    return { error: "感想を入力してください" };
  }
  if (body.trim().length > 1000) {
    return { error: "1000文字以内で入力してください" };
  }

  const authorName =
    typeof authorNameRaw === "string" && authorNameRaw.trim()
      ? authorNameRaw.trim().slice(0, 100)
      : "名前未設定";

  const [work] = await db.select().from(works).where(eq(works.slug, slug)).limit(1);
  if (!work) return { error: "作品が見つかりません" };

  const parentId =
    typeof parentIdRaw === "string" && parentIdRaw.trim() ? Number(parentIdRaw) : null;
  if (parentId !== null) {
    const [parent] = await db
      .select({ id: comments.id })
      .from(comments)
      .where(and(eq(comments.id, parentId), eq(comments.workId, work.id)))
      .limit(1);
    if (!parent) return { error: "返信先のコメントが見つかりません" };
  }

  const imageUrl = sanitizeImageUrl(formData.get("imageUrl"));

  const isOfficial = await checkAdminAuth();
  const { userId, anonId, isFirstComment } = await resolveCommentIdentity();
  await db.insert(comments).values({
    workId: work.id,
    parentId,
    body: body.trim(),
    imageUrl,
    authorName,
    userId,
    anonId,
    isOfficial,
    isFirstComment,
  });
  revalidatePath(`/works/${slug}`);
  revalidatePath("/");
  return { success: true, isFirstComment };
}

export async function likeComment(commentId: number): Promise<void> {
  await db
    .update(comments)
    .set({ likeCount: sql`${comments.likeCount} + 1` })
    .where(eq(comments.id, commentId));
}

export async function unlikeComment(commentId: number): Promise<void> {
  await db
    .update(comments)
    .set({ likeCount: sql`GREATEST(${comments.likeCount} - 1, 0)` })
    .where(eq(comments.id, commentId));
}

export async function deleteComment(commentId: number): Promise<{ error?: string }> {
  if (!(await checkAdminAuth())) return { error: "Unauthorized" };
  await db.delete(comments).where(eq(comments.id, commentId));
  revalidatePath("/admin/comments");
  revalidatePath("/");
  return {};
}
