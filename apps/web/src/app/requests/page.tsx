import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { works } from "@kansou/db";
import { eq, desc } from "drizzle-orm";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "追加されたリクエスト作品",
  description: "ユーザーからのリクエストを受けて感想ログに追加された作品の一覧です。",
};

const TYPE_LABELS: Record<string, string> = {
  anime: "アニメ", manga: "漫画", drama: "ドラマ", movie: "映画",
};
const TYPE_STYLES: Record<string, string> = {
  anime: "bg-purple-100 text-purple-700",
  manga: "bg-blue-100 text-blue-700",
  drama: "bg-green-100 text-green-700",
  movie: "bg-orange-100 text-orange-700",
};

export default async function AddedRequestsPage() {
  const rows = await db
    .select({ id: works.id, slug: works.slug, title: works.title, type: works.type })
    .from(works)
    .where(eq(works.fromRequest, true))
    .orderBy(desc(works.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/request" className="text-sm text-accent-500 hover:underline">← リクエストページへ戻る</Link>
        <h1 className="font-head text-2xl font-bold mt-3">追加されたリクエスト作品</h1>
        <p className="text-sm text-ink-muted mt-1">
          みなさんのリクエストを受けて感想ログに追加した作品です。
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-center text-ink-muted py-12">まだ追加された作品はありません</p>
      ) : (
        <div className="grid gap-2">
          {rows.map((w) => (
            <Link
              key={w.id}
              href={`/works/${w.slug}`}
              className="flex items-center justify-between min-w-0 bg-white rounded-card border border-line px-4 py-3 hover:border-accent-300 transition-all"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[w.type]}`}>
                  {TYPE_LABELS[w.type]}
                </span>
                <span className="font-medium truncate min-w-0">{w.title}</span>
              </div>
              <span className="shrink-0 text-xs text-accent-400 ml-3">見る →</span>
            </Link>
          ))}
        </div>
      )}

      <Link
        href="/request"
        className="flex items-center justify-between bg-accent-50 border border-accent-100 rounded-card px-4 py-2.5 hover:bg-accent-100 transition-colors"
      >
        <span className="text-sm text-accent-700">お探しの作品がない場合はリクエストできます</span>
        <span className="text-accent-500 text-sm shrink-0 ml-2">→</span>
      </Link>
    </div>
  );
}
