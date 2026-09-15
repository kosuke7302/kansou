import { randomUUID } from "crypto";
import { cookies } from "next/headers";

const ANON_ID_COOKIE = "kansou_anon_id";

// ログイン不要な機能（評価・コメントの初回判定など）で「同じブラウザ」を識別するためのCookie。
// なければ発行する。Server Action/Server Componentからのみ呼び出せる。
export async function getOrCreateAnonId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(ANON_ID_COOKIE)?.value;
  if (existing) return existing;

  const anonId = randomUUID();
  jar.set(ANON_ID_COOKIE, anonId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return anonId;
}

// 発行せず、既にあれば読むだけ（副作用なしで参照したい場面向け）
export async function peekAnonId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ANON_ID_COOKIE)?.value ?? null;
}
