"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { workRequests, works } from "@kansou/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type WorkRequestActionState = { success?: boolean; error?: string };

export async function submitWorkRequest(
  _prev: WorkRequestActionState,
  formData: FormData
): Promise<WorkRequestActionState> {
  const title = formData.get("title")?.toString().trim() ?? "";
  const type = formData.get("type")?.toString() || null;
  const note = formData.get("note")?.toString().trim() || null;
  const requesterName = formData.get("requesterName")?.toString().trim() || null;

  if (!title || title.length > 255) return { error: "作品名を入力してください（255文字以内）" };
  if (note && note.length > 1000) return { error: "補足は1000文字以内で入力してください" };
  const validTypes = ["anime", "manga", "drama", "movie"];
  if (type && !validTypes.includes(type)) return { error: "ジャンルの指定が不正です" };

  await db.insert(workRequests).values({
    title,
    type: type as "anime" | "manga" | "drama" | "movie" | null,
    note,
    requesterName,
  });

  return { success: true };
}

async function checkAuth() {
  const jar = await cookies();
  return jar.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

export async function updateRequestStatus(
  requestId: number,
  status: "pending" | "in_progress" | "added" | "rejected"
): Promise<{ error?: string }> {
  if (!(await checkAuth())) return { error: "Unauthorized" };
  await db
    .update(workRequests)
    .set({ status, updatedAt: new Date() })
    .where(eq(workRequests.id, requestId));
  revalidatePath("/admin/requests");
  return {};
}

export async function linkRequestToWork(
  requestId: number,
  slug: string
): Promise<{ error?: string }> {
  if (!(await checkAuth())) return { error: "Unauthorized" };

  const trimmed = slug.trim();
  if (!trimmed) {
    await db.update(workRequests).set({ linkedWorkId: null }).where(eq(workRequests.id, requestId));
    revalidatePath("/admin/requests");
    revalidatePath("/requests");
    revalidatePath("/");
    return {};
  }

  const [work] = await db.select({ id: works.id }).from(works).where(eq(works.slug, trimmed)).limit(1);
  if (!work) return { error: `スラグ "${trimmed}" の作品が見つかりません` };

  await db.update(workRequests).set({ linkedWorkId: work.id }).where(eq(workRequests.id, requestId));
  revalidatePath("/admin/requests");
  revalidatePath("/requests");
  revalidatePath("/");
  return {};
}
