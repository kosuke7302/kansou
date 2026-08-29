"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { contactMessages } from "@kansou/db";

export type ContactActionState = {
  success?: boolean;
  error?: string;
};

export async function submitContact(
  _prev: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const name = formData.get("name")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  const body = formData.get("body")?.toString().trim() ?? "";

  if (!name || name.length > 100) return { error: "お名前を入力してください（100文字以内）" };
  if (!body || body.length < 10) return { error: "内容を10文字以上入力してください" };
  if (body.length > 2000) return { error: "内容は2000文字以内で入力してください" };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "メールアドレスの形式が正しくありません" };
  }

  await db.insert(contactMessages).values({
    name,
    email: email || null,
    body,
  });

  return { success: true };
}

export async function deleteContactMessage(id: number): Promise<{ error?: string }> {
  const jar = await cookies();
  if (jar.get("admin_session")?.value !== process.env.ADMIN_PASSWORD) {
    return { error: "Unauthorized" };
  }
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
  revalidatePath("/admin/contact");
  return {};
}
