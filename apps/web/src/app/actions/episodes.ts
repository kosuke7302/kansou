"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { episodes } from "@kansou/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function checkAuth() {
  const jar = await cookies();
  return jar.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

export async function updateEpisodeTitle(
  episodeId: number,
  title: string | null,
  workSlug: string,
): Promise<{ error?: string }> {
  if (!(await checkAuth())) return { error: "Unauthorized" };
  await db.update(episodes).set({ title: title || null }).where(eq(episodes.id, episodeId));
  revalidatePath(`/works/${workSlug}`);
  return {};
}
