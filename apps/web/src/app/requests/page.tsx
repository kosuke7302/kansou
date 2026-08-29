import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { workRequests, works } from "@kansou/db";
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
    .select({
      id: workRequests.id,
      title: workRequests.title,
      type: workRequests.type,
      linkedSlug: works.slug,
    })
    .from(workRequests)
    .leftJoin(works, eq(works.id, workRequests.linkedWorkId))
    .where(eq(workRequests.status, "added"))
    .orderBy(desc(workRequests.updatedAt));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/request" className="text-sm text-indigo-500 hover:underline">← リクエストページへ戻る</Link>
        <h1 className="text-2xl font-bold mt-3">✅ 追加されたリクエスト作品</h1>
        <p className="text-sm text-gray-500 mt-1">
          みなさんのリクエストを受けて感想ログに追加した作品です。
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-center text-gray-400 py-12">まだ追加された作品はありません</p>
      ) : (
        <div className="grid gap-2">
          {rows.map((r) => (
            <Link
              key={r.id}
              href={r.linkedSlug ? `/works/${r.linkedSlug}` : `/search?q=${encodeURIComponent(r.title)}`}
              className="flex items-center justify-between min-w-0 bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 min-w-0">
                {r.type && (
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[r.type]}`}>
                    {TYPE_LABELS[r.type]}
                  </span>
                )}
                <span className="font-medium truncate min-w-0">{r.title}</span>
              </div>
              <span className="shrink-0 text-xs text-indigo-400 ml-3">見る →</span>
            </Link>
          ))}
        </div>
      )}

      <Link
        href="/request"
        className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-2.5 hover:bg-indigo-100 transition-colors"
      >
        <span className="text-sm text-indigo-700">お探しの作品がない場合はリクエストできます</span>
        <span className="text-indigo-500 text-sm shrink-0 ml-2">→</span>
      </Link>
    </div>
  );
}
