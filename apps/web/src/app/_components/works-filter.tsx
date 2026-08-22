"use client";

import { useState } from "react";
import Link from "next/link";

export type ContentType = "anime" | "manga" | "drama" | "movie";
export type Platform = "netflix" | "amazon_prime" | "disney_plus";

export type Work = {
  slug: string;
  title: string;
  type: ContentType;
  platform: Platform | null;
  episodeCount: number;
  commentCount: number;
  recentCommentCount: number;
};

const TYPE_STYLES: Record<ContentType, string> = {
  anime: "bg-purple-100 text-purple-700",
  manga: "bg-blue-100 text-blue-700",
  drama: "bg-green-100 text-green-700",
  movie: "bg-orange-100 text-orange-700",
};

const TYPE_LABELS: Record<ContentType, string> = {
  anime: "アニメ",
  manga: "漫画",
  drama: "ドラマ",
  movie: "映画",
};

const PLATFORM_META: Record<Platform, { label: string; badge: string }> = {
  netflix: { label: "Netflix", badge: "bg-red-100 text-red-700" },
  amazon_prime: { label: "Prime", badge: "bg-sky-100 text-sky-700" },
  disney_plus: { label: "Disney+", badge: "bg-blue-100 text-blue-800" },
};

const GENRE_TABS = [
  { key: "all", label: "すべて" },
  { key: "anime", label: "アニメ" },
  { key: "manga", label: "漫画" },
  { key: "drama", label: "ドラマ" },
  { key: "movie", label: "映画" },
] as const;

const PLATFORM_TABS: { key: Platform | "all"; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "netflix", label: "Netflix" },
  { key: "amazon_prime", label: "Prime Video" },
  { key: "disney_plus", label: "Disney+" },
];

type GenreKey = (typeof GENRE_TABS)[number]["key"];

const PAGE_SIZE = 50;

function WorkCard({ work }: { work: Work }) {
  return (
    <Link
      href={`/works/${work.slug}`}
      className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-indigo-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[work.type]}`}>
          {TYPE_LABELS[work.type]}
        </span>
        {work.platform && (
          <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${PLATFORM_META[work.platform].badge}`}>
            {PLATFORM_META[work.platform].label}
          </span>
        )}
        <span className="font-medium truncate">{work.title}</span>
      </div>
      <span className="shrink-0 text-sm text-gray-400 ml-3">
        💬 {work.commentCount.toLocaleString()}
      </span>
    </Link>
  );
}

export function WorksFilter({ works }: { works: Work[] }) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<GenreKey>("all");
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [page, setPage] = useState(1);

  const isFiltering = query.trim() !== "" || genre !== "all" || platform !== "all";

  const filtered = works.filter((w) => {
    const matchesGenre = genre === "all" || w.type === genre;
    const matchesPlatform = platform === "all" || w.platform === platform;
    const matchesQuery = w.title.toLowerCase().includes(query.toLowerCase());
    return matchesGenre && matchesPlatform && matchesQuery;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 直近7日間コメント増加数TOP10
  const trending = [...works]
    .filter((w) => w.recentCommentCount > 0)
    .sort((a, b) => b.recentCommentCount - a.recentCommentCount)
    .slice(0, 10);

  // コメント数全体TOP10（トレンドがない場合のフォールバック）
  const popular = [...works]
    .sort((a, b) => b.commentCount - a.commentCount)
    .slice(0, 10);

  const topList = trending.length > 0 ? trending : popular;
  const topLabel = trending.length > 0 ? "🔥 今週の話題作 TOP10" : "🔥 人気の作品 TOP10";

  function handleGenreChange(key: GenreKey) {
    setGenre(key);
    setPage(1);
  }

  function handlePlatformChange(key: Platform | "all") {
    setPlatform(key);
    setPage(1);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <div className="space-y-5">
      {/* 検索バー */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="search"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="作品タイトルで検索..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        />
      </div>

      {/* ジャンルタブ */}
      <div className="flex gap-2 flex-wrap">
        {GENRE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleGenreChange(tab.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              genre === tab.key
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 配信サービスフィルター */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-xs text-gray-400 font-medium">配信:</span>
        {PLATFORM_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handlePlatformChange(tab.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              platform === tab.key
                ? tab.key === "netflix"
                  ? "bg-red-600 text-white"
                  : tab.key === "amazon_prime"
                    ? "bg-sky-600 text-white"
                    : tab.key === "disney_plus"
                      ? "bg-blue-800 text-white"
                      : "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 結果 */}
      {isFiltering ? (
        <section>
          <p className="text-sm text-gray-500 mb-3">
            {filtered.length}件の作品
            {totalPages > 1 && <span className="ml-1 text-gray-400">（{page}/{totalPages}ページ）</span>}
          </p>
          {paginated.length > 0 ? (
            <>
              <div className="grid gap-2">
                {paginated.map((work) => (
                  <WorkCard key={work.slug} work={work} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:border-indigo-300 transition-colors"
                  >
                    ← 前
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                    .reduce<(number | "…")[]>((acc, n, idx, arr) => {
                      if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("…");
                      acc.push(n);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "…" ? (
                        <span key={`ellipsis-${idx}`} className="text-gray-400 text-sm px-1">…</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setPage(item as number)}
                          className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                            page === item
                              ? "bg-indigo-600 text-white"
                              : "border border-gray-200 hover:border-indigo-300"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:border-indigo-300 transition-colors"
                  >
                    次 →
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-400 py-12">作品が見つかりませんでした</p>
          )}
        </section>
      ) : (
        <section>
          <h2 className="text-base font-semibold mb-3">{topLabel}</h2>
          <div className="grid gap-2">
            {topList.map((work, i) => (
              <div key={work.slug} className="flex items-center gap-3">
                <span className={`w-6 text-center text-sm font-bold shrink-0 ${i < 3 ? "text-indigo-500" : "text-gray-400"}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <WorkCard work={work} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
