"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { userProfiles } from "@kansou/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateNickname(nickname: string): Promise<{ error?: string }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "ログインが必要です" };

  const trimmed = nickname.trim().slice(0, 100);
  if (!trimmed) return { error: "ニックネームを入力してください" };

  await db
    .insert(userProfiles)
    .values({ userId, nickname: trimmed })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: { nickname: trimmed, updatedAt: new Date() },
    });

  revalidatePath("/account");
  return {};
}
