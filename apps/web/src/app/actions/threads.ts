"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { comments, threads, works } from "@kansou/db";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getOrCreateAnonId } from "@/lib/anon-id";
import { isThreadPilot } from "@/lib/thread-pilot";

export type ThreadActionState = { error?: string; success?: boolean; threadId?: number };

async function resolveAuthor() {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const anonId = userId ? null : await getOrCreateAnonId();
  return { userId, anonId };
}

function readNickname(raw: FormDataEntryValue | null): string {
  return typeof raw === "string" && raw.trim() ? raw.trim().slice(0, 100) : "名前未設定";
}

function readBody(raw: FormDataEntryValue | null): string | null {
  if (typeof raw !== "string" || raw.trim().length === 0) return null;
  if (raw.trim().length > 1000) return null;
  return raw.trim();
}

export async function createThread(
  _prev: ThreadActionState,
  formData: FormData
): Promise<ThreadActionState> {
  const slug = formData.get("slug");
  const titleRaw = formData.get("title");
  if (typeof slug !== "string" || !isThreadPilot(slug)) return { error: "この作品ではスレを立てられません" };
  if (typeof titleRaw !== "string" || titleRaw.trim().length === 0) return { error: "スレのタイトルを入力してください" };
  if (titleRaw.trim().length > 100) return { error: "タイトルは100文字以内で入力してください" };

  const body = readBody(formData.get("body"));
  if (!body) return { error: "最初の書き込みを入力してください（1000文字以内）" };

  const [work] = await db.select({ id: works.id }).from(works).where(eq(works.slug, slug)).limit(1);
  if (!work) return { error: "作品が見つかりません" };

  const authorName = readNickname(formData.get("authorName"));
  const { userId, anonId } = await resolveAuthor();

  const [thread] = await db
    .insert(threads)
    .values({ workId: work.id, title: titleRaw.trim(), authorName, userId, anonId })
    .returning({ id: threads.id });

  await db.insert(comments).values({
    threadId: thread.id,
    workId: work.id,
    body,
    authorName,
    userId,
    anonId,
  });

  revalidatePath(`/works/${slug}`);
  return { success: true, threadId: thread.id };
}

export async function postThreadComment(
  _prev: ThreadActionState,
  formData: FormData
): Promise<ThreadActionState> {
  const slug = formData.get("slug");
  const threadIdRaw = formData.get("threadId");
  if (typeof slug !== "string" || !isThreadPilot(slug)) return { error: "この作品ではスレに書き込めません" };

  const threadId = typeof threadIdRaw === "string" ? Number(threadIdRaw) : NaN;
  if (!Number.isInteger(threadId)) return { error: "スレが見つかりません" };

  const [thread] = await db
    .select({ id: threads.id, workId: threads.workId })
    .from(threads)
    .innerJoin(works, eq(works.id, threads.workId))
    .where(eq(threads.id, threadId))
    .limit(1);
  if (!thread) return { error: "スレが見つかりません" };

  const body = readBody(formData.get("body"));
  if (!body) return { error: "書き込みを入力してください（1000文字以内）" };

  const authorName = readNickname(formData.get("authorName"));
  const { userId, anonId } = await resolveAuthor();

  await db.insert(comments).values({
    threadId,
    workId: thread.workId,
    body,
    authorName,
    userId,
    anonId,
  });

  revalidatePath(`/works/${slug}/threads/${threadId}`);
  revalidatePath(`/works/${slug}`);
  return { success: true, threadId };
}
