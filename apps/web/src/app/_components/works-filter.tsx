"use client";

import { useState } from "react";
import Link from "next/link";

export type ContentType = "anime" | "manga" | "drama" | "movie";

export type Work = {
  slug: string;
  title: string;
  type: ContentType;
  episodeCount: number;
  commentCount: number;
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

const GENRE_TABS = [
  { key: "all", label: "すべて" },
  { key: "anime", label: "📺 アニメ" },
  { key: "manga", label: "📚 漫画" },
  { key: "drama", label: "🎭 ドラマ" },
  { key: "movie", label: "🎬 映画" },
] as const;

type GenreKey = (typeof GENRE_TABS)[number]["key"];

function WorkCard({ work }: { work: Work }) {
  return (
    <Link
      href={`/works/${work.slug}`}
      className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-indigo-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[work.type]}`}>
          {TYPE_LABELS[work.type]}
        </span>
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

  const isFiltering = query.trim() !== "" || genre !== "all";

  const filtered = works.filter((w) => {
    const matchesGenre = genre === "all" || w.type === genre;
    const matchesQuery = w.title.toLowerCase().includes(query.toLowerCase());
    return matchesGenre && matchesQuery;
  });

  const popular = [...works]
    .sort((a, b) => b.commentCount - a.commentCount)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* 検索バー */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="作品タイトルで検索..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        />
      </div>

      {/* ジャンルタブ */}
      <div className="flex gap-2 flex-wrap">
        {GENRE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setGenre(tab.key)}
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

      {/* 絞り込み結果 or 人気一覧 */}
      {isFiltering ? (
        <section>
          <p className="text-sm text-gray-500 mb-3">
            {filtered.length}件の作品が見つかりました
          </p>
          {filtered.length > 0 ? (
            <div className="grid gap-3">
              {filtered.map((work) => (
                <WorkCard key={work.slug} work={work} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12">作品が見つかりませんでした</p>
          )}
        </section>
      ) : (
        <section>
          <h2 className="text-base font-semibold mb-3">🔥 人気の作品 TOP10</h2>
          <div className="grid gap-3">
            {popular.map((work, i) => (
              <div key={work.slug} className="flex items-center gap-3">
                <span className={`w-6 text-center text-sm font-bold ${i < 3 ? "text-indigo-500" : "text-gray-400"}`}>
                  {i + 1}
                </span>
                <div className="flex-1">
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
