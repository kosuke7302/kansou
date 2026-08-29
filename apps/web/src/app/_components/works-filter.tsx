"use client";

import { useState } from "react";
import Link from "next/link";

export type ContentType = "anime" | "manga" | "drama" | "movie";
export type Platform = "netflix" | "amazon_prime" | "disney_plus" | "hulu" | "u_next" | "d_anime" | "abema" | "lemino" | "fod" | "tver" | "dmm_tv" | "telasa" | "anime_times";

export type Work = {
  slug: string;
  title: string;
  type: ContentType;
  platforms: Platform[] | null;
  episodeCount: number;
  commentCount: number;
  recentCommentCount: number;
};

export type AddedRequest = {
  id: number;
  title: string;
  type: ContentType | null;
  linkedSlug: string | null;
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

const PLATFORM_META: Record<Platform, { label: string; badge: string; activeBg: string }> = {
  netflix:      { label: "Netflix",     badge: "bg-red-100 text-red-700",       activeBg: "bg-red-600 text-white" },
  amazon_prime: { label: "Prime Video", badge: "bg-sky-100 text-sky-700",       activeBg: "bg-sky-600 text-white" },
  disney_plus:  { label: "Disney+",     badge: "bg-blue-100 text-blue-800",     activeBg: "bg-blue-800 text-white" },
  hulu:         { label: "Hulu",        badge: "bg-green-100 text-green-700",   activeBg: "bg-green-600 text-white" },
  u_next:       { label: "U-NEXT",      badge: "bg-gray-800 text-white",        activeBg: "bg-gray-900 text-white" },
  d_anime:      { label: "dアニメ",     badge: "bg-pink-100 text-pink-700",     activeBg: "bg-pink-600 text-white" },
  abema:        { label: "ABEMA",       badge: "bg-teal-100 text-teal-700",     activeBg: "bg-teal-500 text-white" },
  lemino:       { label: "Lemino",      badge: "bg-indigo-100 text-indigo-800", activeBg: "bg-indigo-800 text-white" },
  fod:          { label: "FOD",         badge: "bg-rose-100 text-rose-700",     activeBg: "bg-rose-600 text-white" },
  tver:         { label: "TVer",        badge: "bg-amber-100 text-amber-700",   activeBg: "bg-amber-500 text-white" },
  dmm_tv:       { label: "DMM TV",      badge: "bg-neutral-200 text-neutral-800", activeBg: "bg-neutral-800 text-white" },
  telasa:       { label: "TELASA",      badge: "bg-cyan-100 text-cyan-700",     activeBg: "bg-cyan-600 text-white" },
  anime_times:  { label: "アニメタイムズ", badge: "bg-violet-100 text-violet-700", activeBg: "bg-violet-600 text-white" },
};

const GENRE_TABS = [
  { key: "all", label: "すべて" },
  { key: "anime", label: "アニメ" },
  { key: "manga", label: "漫画" },
  { key: "drama", label: "ドラマ" },
  { key: "movie", label: "映画" },
] as const;

const PLATFORM_TABS: { key: Platform | "all"; label: string }[] = [
  { key: "all",          label: "すべて" },
  { key: "netflix",      label: "Netflix" },
  { key: "amazon_prime", label: "Prime Video" },
  { key: "disney_plus",  label: "Disney+" },
  { key: "hulu",         label: "Hulu" },
  { key: "u_next",       label: "U-NEXT" },
  { key: "d_anime",      label: "dアニメ" },
  { key: "abema",        label: "ABEMA" },
  { key: "lemino",       label: "Lemino" },
  { key: "fod",          label: "FOD" },
  { key: "tver",         label: "TVer" },
  { key: "dmm_tv",       label: "DMM TV" },
  { key: "telasa",       label: "TELASA" },
  { key: "anime_times",  label: "アニメタイムズ" },
];

type GenreKey = (typeof GENRE_TABS)[number]["key"];

const PAGE_SIZE = 50;

function WorkCard({ work }: { work: Work }) {
  return (
    <Link
      href={`/works/${work.slug}`}
      className="flex items-center justify-between min-w-0 bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-indigo-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[work.type]}`}>
          {TYPE_LABELS[work.type]}
        </span>
        <span className="font-medium truncate min-w-0">{work.title}</span>
      </div>
      <span className="shrink-0 text-sm text-gray-400 ml-3">
        💬 {work.commentCount.toLocaleString()}
      </span>
    </Link>
  );
}

export function WorksFilter({ works, addedRequests = [] }: { works: Work[]; addedRequests?: AddedRequest[] }) {
  const [genre, setGenre] = useState<GenreKey>("all");
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [page, setPage] = useState(1);
  const [showPlatforms, setShowPlatforms] = useState(false);

  const isFiltering = genre !== "all" || platform !== "all";

  const filtered = works.filter((w) => {
    const matchesGenre = genre === "all" || w.type === genre;
    const matchesPlatform = platform === "all" || (w.platforms ?? []).includes(platform);
    return matchesGenre && matchesPlatform;
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

  return (
    <div className="space-y-5">
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
      <div>
        <button
          onClick={() => setShowPlatforms((v) => !v)}
          className="flex items-center gap-1 text-xs text-gray-500 font-medium"
        >
          配信サービスで絞り込む
          {platform !== "all" && (
            <span className="text-indigo-600">（{PLATFORM_TABS.find((t) => t.key === platform)?.label}）</span>
          )}
          <span className={`transition-transform ${showPlatforms ? "rotate-180" : ""}`}>▾</span>
        </button>
        {showPlatforms && (
          <div className="flex gap-2 flex-wrap items-center mt-2">
            {PLATFORM_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handlePlatformChange(tab.key)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  platform === tab.key
                    ? tab.key === "all"
                      ? "bg-indigo-600 text-white"
                      : (PLATFORM_META[tab.key as Platform]?.activeBg ?? "bg-indigo-600 text-white")
                    : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 作品リクエスト導線 */}
      <Link
        href="/request"
        className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-2.5 hover:bg-indigo-100 transition-colors"
      >
        <span className="text-sm text-indigo-700">お探しの作品がない場合はリクエストできます</span>
        <span className="text-indigo-500 text-sm shrink-0 ml-2">→</span>
      </Link>

      {/* リクエストで追加された作品（絞り込みなし時のみ） */}
      {!isFiltering && addedRequests.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-3">✅ リクエストで追加された作品</h2>
          <div className="grid gap-2">
            {addedRequests.map((r) => (
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
          <Link href="/requests" className="inline-block text-xs text-indigo-500 hover:underline mt-2">
            すべて見る →
          </Link>
        </section>
      )}

      {/* 話題の作品（絞り込みなし時のみ） */}
      {!isFiltering && (
        <section>
          <h2 className="text-base font-semibold mb-3">{topLabel}</h2>
          <div className="grid gap-2">
            {topList.map((work, i) => (
              <div key={work.slug} className="flex items-center gap-3 min-w-0">
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

      {/* 全作品／絞り込み結果 */}
      <section>
        <p className="text-sm text-gray-500 mb-3">
          {isFiltering ? `${filtered.length}件の作品` : `すべての作品（${filtered.length}件）`}
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
    </div>
  );
}
