"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { works, episodes } from "@kansou/db";
import { eq, max, and, isNull, isNotNull } from "drizzle-orm";

export type LoginState = { error?: string };
export type AddWorkState = { error?: string; success?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get("password")?.toString();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || password !== adminPassword) {
    return { error: "パスワードが違います" };
  }
  const jar = await cookies();
  jar.set("admin_session", adminPassword, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  redirect("/admin/works");
}

export async function logout() {
  const jar = await cookies();
  jar.delete("admin_session");
  redirect("/admin/login");
}

function toSlug(raw: string) {
  return raw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function addWork(_prev: AddWorkState, formData: FormData): Promise<AddWorkState> {
  const title = formData.get("title")?.toString().trim() ?? "";
  const slugRaw = formData.get("slug")?.toString().trim() ?? "";
  const type = formData.get("type")?.toString() as "manga" | "anime" | "drama" | "movie";
  const platforms = formData.getAll("platforms").map(p => p.toString()).filter(Boolean);
  const description = formData.get("description")?.toString().trim() || null;
  const keywords = formData.get("keywords")?.toString().trim() || null;
  const episodeCount = Number(formData.get("episodeCount") ?? 0);
  const volumeCount = Number(formData.get("volumeCount") ?? 0);
  const chapterCount = Number(formData.get("chapterCount") ?? 0);

  if (!title) return { error: "タイトルを入力してください" };
  if (!["manga", "anime", "drama", "movie"].includes(type)) return { error: "ジャンルが不正です" };

  const slug = toSlug(slugRaw) || toSlug(title);
  if (!slug) return { error: "スラグを入力してください（英数字・ハイフンのみ）" };

  const [existing] = await db.select({ id: works.id }).from(works).where(eq(works.slug, slug)).limit(1);
  if (existing) return { error: `スラグ "${slug}" は既に使用されています` };

  const [work] = await db
    .insert(works)
    .values({ slug, title, type, platforms: platforms.length > 0 ? platforms : null, description, keywords })
    .returning();

  if (type === "manga") {
    if (volumeCount > 0) {
      const rows = Array.from({ length: volumeCount }, (_, i) => ({
        workId: work.id, episodeNumber: null as number | null, volumeNumber: i + 1,
      }));
      for (let i = 0; i < rows.length; i += 500) await db.insert(episodes).values(rows.slice(i, i + 500));
    }
    if (chapterCount > 0) {
      const rows = Array.from({ length: chapterCount }, (_, i) => ({
        workId: work.id, episodeNumber: i + 1, volumeNumber: null as number | null,
      }));
      for (let i = 0; i < rows.length; i += 500) await db.insert(episodes).values(rows.slice(i, i + 500));
    }
  } else if (type === "movie") {
    await db.insert(episodes).values({ workId: work.id, episodeNumber: 1, title: "本編" });
  } else {
    if (episodeCount < 1) return { error: "話数を入力してください" };
    const rows = Array.from({ length: episodeCount }, (_, i) => ({ workId: work.id, episodeNumber: i + 1 }));
    for (let i = 0; i < rows.length; i += 500) await db.insert(episodes).values(rows.slice(i, i + 500));
  }

  revalidatePath("/admin/works");
  revalidatePath("/");
  return { success: `「${title}」を追加しました（スラグ: ${slug}）` };
}

export async function updateWork(_prev: AddWorkState, formData: FormData): Promise<AddWorkState> {
  const id = Number(formData.get("id"));
  if (!id) return { error: "作品IDが不正です" };

  const title = formData.get("title")?.toString().trim() ?? "";
  const platforms = formData.getAll("platforms").map(p => p.toString()).filter(Boolean);
  const description = formData.get("description")?.toString().trim() || null;
  const keywords = formData.get("keywords")?.toString().trim() || null;
  const addEpisodes = Number(formData.get("addEpisodes") ?? 0);
  const addVolumes = Number(formData.get("addVolumes") ?? 0);
  const addChapters = Number(formData.get("addChapters") ?? 0);

  if (!title) return { error: "タイトルを入力してください" };

  const [work] = await db.select().from(works).where(eq(works.id, id)).limit(1);
  if (!work) return { error: "作品が見つかりません" };

  await db
    .update(works)
    .set({ title, platforms: platforms.length > 0 ? platforms : null, description, keywords })
    .where(eq(works.id, id));

  // 話数追加（アニメ・ドラマ）
  if (addEpisodes > 0 && work.type !== "manga" && work.type !== "movie") {
    const [{ maxEp }] = await db
      .select({ maxEp: max(episodes.episodeNumber) })
      .from(episodes)
      .where(and(eq(episodes.workId, id), isNotNull(episodes.episodeNumber)));
    const start = (maxEp ?? 0) + 1;
    const rows = Array.from({ length: addEpisodes }, (_, i) => ({ workId: id, episodeNumber: start + i }));
    for (let i = 0; i < rows.length; i += 500) await db.insert(episodes).values(rows.slice(i, i + 500));
  }

  // 巻追加（漫画）
  if (addVolumes > 0 && work.type === "manga") {
    const [{ maxVol }] = await db
      .select({ maxVol: max(episodes.volumeNumber) })
      .from(episodes)
      .where(and(eq(episodes.workId, id), isNull(episodes.episodeNumber)));
    const start = (maxVol ?? 0) + 1;
    const rows = Array.from({ length: addVolumes }, (_, i) => ({
      workId: id, episodeNumber: null as number | null, volumeNumber: start + i,
    }));
    for (let i = 0; i < rows.length; i += 500) await db.insert(episodes).values(rows.slice(i, i + 500));
  }

  // 話数追加（漫画の章）
  if (addChapters > 0 && work.type === "manga") {
    const [{ maxChap }] = await db
      .select({ maxChap: max(episodes.episodeNumber) })
      .from(episodes)
      .where(and(eq(episodes.workId, id), isNotNull(episodes.episodeNumber)));
    const start = (maxChap ?? 0) + 1;
    const rows = Array.from({ length: addChapters }, (_, i) => ({
      workId: id, episodeNumber: start + i, volumeNumber: null as number | null,
    }));
    for (let i = 0; i < rows.length; i += 500) await db.insert(episodes).values(rows.slice(i, i + 500));
  }

  revalidatePath(`/works/${work.slug}`);
  revalidatePath("/admin/works");
  revalidatePath("/");
  return { success: "更新しました" };
}

export async function deleteWork(workId: number): Promise<{ error?: string }> {
  const jar = await cookies();
  if (jar.get("admin_session")?.value !== process.env.ADMIN_PASSWORD) {
    return { error: "Unauthorized" };
  }

  const [work] = await db.select().from(works).where(eq(works.id, workId)).limit(1);
  if (!work) return { error: "作品が見つかりません" };

  await db.delete(works).where(eq(works.id, workId));

  revalidatePath(`/works/${work.slug}`);
  revalidatePath("/admin/works");
  revalidatePath("/");
  return {};
}

export async function bulkAddWorks(_prev: AddWorkState, formData: FormData): Promise<AddWorkState> {
  const text = formData.get("works")?.toString() ?? "";
  const lines = text.trim().split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return { error: "データを入力してください" };

  const results: string[] = [];
  const errors: string[] = [];

  for (const line of lines) {
    const parts = line.split(",").map(p => p.trim());
    if (parts.length < 3) { errors.push(`形式エラー: ${line}`); continue; }
    const [title, type, countStr, slugInput, platformStr] = parts;
    const platforms = platformStr ? platformStr.split("|").map(p => p.trim()).filter(Boolean) : [];
    if (!["manga", "anime", "drama", "movie"].includes(type)) {
      errors.push(`ジャンル不正 (${type}): ${title}`); continue;
    }
    const count = parseInt(countStr);
    if (isNaN(count) || count < 1) { errors.push(`話数不正: ${title}`); continue; }
    const slug = toSlug(slugInput || title);
    if (!slug) { errors.push(`スラグ生成失敗: ${title} — スラグ列を追加してください`); continue; }

    const [existing] = await db.select({ id: works.id }).from(works).where(eq(works.slug, slug)).limit(1);
    if (existing) { errors.push(`スキップ（重複）: ${title} (${slug})`); continue; }

    const [work] = await db
      .insert(works)
      .values({ slug, title, type: type as "manga" | "anime" | "drama" | "movie", platforms: platforms.length > 0 ? platforms : null })
      .returning();

    if (type === "manga") {
      const rows = Array.from({ length: count }, (_, i) => ({
        workId: work.id, episodeNumber: null as number | null, volumeNumber: i + 1,
      }));
      for (let i = 0; i < rows.length; i += 500) await db.insert(episodes).values(rows.slice(i, i + 500));
    } else if (type === "movie") {
      await db.insert(episodes).values({ workId: work.id, episodeNumber: 1, title: "本編" });
    } else {
      const rows = Array.from({ length: count }, (_, i) => ({ workId: work.id, episodeNumber: i + 1 }));
      for (let i = 0; i < rows.length; i += 500) await db.insert(episodes).values(rows.slice(i, i + 500));
    }
    results.push(`✓ ${title}`);
  }

  revalidatePath("/admin/works");
  revalidatePath("/");

  const msg = [...results, ...errors].join("\n");
  if (errors.length > 0 && results.length === 0) return { error: msg };
  return { success: msg };
}
