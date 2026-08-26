"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { favorites } from "@kansou/db";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(
  workId: number,
  slug: string
): Promise<{ error?: string; favorited?: boolean }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "ログインが必要です" };

  const [existing] = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.workId, workId)))
    .limit(1);

  if (existing) {
    await db.delete(favorites).where(eq(favorites.id, existing.id));
  } else {
    await db.insert(favorites).values({ userId, workId });
  }

  revalidatePath(`/works/${slug}`);
  revalidatePath("/favorites");
  return { favorited: !existing };
}
