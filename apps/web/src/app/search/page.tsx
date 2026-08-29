import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { works } from "@kansou/db";
import { or, ilike } from "drizzle-orm";

const TYPE_LABELS: Record<string, string> = {
  anime: "アニメ", manga: "漫画", drama: "ドラマ", movie: "映画",
};
const TYPE_STYLES: Record<string, string> = {
  anime: "bg-purple-100 text-purple-700",
  manga: "bg-blue-100 text-blue-700",
  drama: "bg-green-100 text-green-700",
  movie: "bg-orange-100 text-orange-700",
};
const PLATFORM_LABELS: Record<string, string> = {
  netflix: "Netflix",
  amazon_prime: "Prime Video",
  disney_plus: "Disney+",
  hulu: "Hulu",
  u_next: "U-NEXT",
  d_anime: "dアニメストア",
  abema: "ABEMA",
  lemino: "Lemino",
  fod: "FOD Premium",
  tver: "TVer",
  dmm_tv: "DMM TV",
  telasa: "TELASA",
  anime_times: "アニメタイムズ",
};

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const { q } = await searchParams;
  if (!q) return { title: "作品検索" };
  return { title: `「${q}」の検索結果`, robots: { index: false } };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const results = query.length > 0
    ? await db
        .select({
          id: works.id,
          slug: works.slug,
          title: works.title,
          type: works.type,
          platforms: works.platforms,
          description: works.description,
        })
        .from(works)
        .where(
          or(
            ilike(works.title, `%${query}%`),
            ilike(works.keywords, `%${query}%`),
            ilike(works.description, `%${query}%`)
          )
        )
        .limit(50)
    : [];

  return (
    <div className="space-y-6">
      <form method="get" action="/search" className="flex gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="作品名・キーワードで検索..."
          autoFocus
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          検索
        </button>
      </form>

      {query && (
        <p className="text-sm text-gray-500">
          「{query}」の検索結果: <span className="font-medium text-gray-700">{results.length}件</span>
        </p>
      )}

      {results.length > 0 ? (
        <div className="space-y-2">
          {results.map((work) => (
            <Link
              key={work.id}
              href={`/works/${work.slug}`}
              className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[work.type]}`}>
                    {TYPE_LABELS[work.type]}
                  </span>
                  {(work.platforms ?? []).map((p) => (
                    <span key={p} className="text-xs text-gray-400">{PLATFORM_LABELS[p] ?? p}</span>
                  ))}
                </div>
                <p className="font-medium text-sm">{work.title}</p>
                {work.description && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{work.description}</p>
                )}
              </div>
              <span className="text-xs text-indigo-400 shrink-0 mt-1">感想を見る →</span>
            </Link>
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-12 space-y-3">
          <p className="text-gray-400">「{query}」に一致する作品が見つかりませんでした</p>
          <Link
            href={`/request?title=${encodeURIComponent(query)}`}
            className="inline-block text-sm text-indigo-600 border border-indigo-200 rounded-lg px-4 py-2 hover:bg-indigo-50 transition-colors"
          >
            この作品をリクエストする →
          </Link>
        </div>
      ) : (
        <p className="text-center text-gray-400 py-12">キーワードを入力して検索してください</p>
      )}
    </div>
  );
}
