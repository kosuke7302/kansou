"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { updateEpisodeTitle, deleteEpisode } from "@/app/actions/episodes";

type Episode = {
  id: number;
  episodeNumber: number | null;
  volumeNumber: number | null;
  title: string | null;
};

type PageData = {
  episodes: Episode[];
  total: number;
  pages: number;
  page: number;
  workType: string;
};

function EpisodeRow({
  ep,
  workSlug,
  onSaved,
  onDeleted,
}: {
  ep: Episode;
  workSlug: string;
  onSaved: (id: number, title: string | null) => void;
  onDeleted: (id: number) => void;
}) {
  const [value, setValue] = useState(ep.title ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const label = ep.volumeNumber != null ? `第${ep.volumeNumber}巻` : `第${ep.episodeNumber}話`;

  function save(newTitle: string | null) {
    startTransition(async () => {
      const res = await updateEpisodeTitle(ep.id, newTitle, workSlug);
      if (!res.error) {
        setValue(newTitle ?? "");
        setSaved(true);
        onSaved(ep.id, newTitle);
        setTimeout(() => setSaved(false), 1500);
      }
    });
  }

  function handleDelete() {
    if (!confirm(`${label}を削除しますか？紐づくコメントも全て削除され、元に戻せません。`)) return;
    startDeleteTransition(async () => {
      const res = await deleteEpisode(ep.id, workSlug);
      if (!res.error) onDeleted(ep.id);
    });
  }

  const dirty = value !== (ep.title ?? "");

  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0">
      <span className="w-16 shrink-0 text-xs text-gray-500 font-mono">{label}</span>
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="サブタイトルなし"
        className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
        disabled={isPending || isDeleting}
        onKeyDown={e => { if (e.key === "Enter" && dirty) save(value || null); }}
      />
      {dirty && (
        <button
          onClick={() => save(value || null)}
          disabled={isPending || isDeleting}
          className="shrink-0 bg-indigo-600 text-white text-xs px-3 py-1 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          保存
        </button>
      )}
      {saved && <span className="shrink-0 text-xs text-green-600">✓</span>}
      {ep.title && !dirty && (
        <button
          onClick={() => save(null)}
          disabled={isPending || isDeleting}
          className="shrink-0 text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
        >
          クリア
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={isPending || isDeleting}
        className="shrink-0 text-xs text-red-500 hover:text-white hover:bg-red-500 border border-red-200 rounded px-2 py-1 disabled:opacity-50"
      >
        {isDeleting ? "削除中..." : "削除"}
      </button>
    </div>
  );
}

export default function EpisodesPage({ params }: { params: Promise<{ id: string }> }) {
  const [workId, setWorkId] = useState<string>("");
  const [workSlug, setWorkSlug] = useState<string>("");
  const [workTitle, setWorkTitle] = useState<string>("");
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | "volume" | "chapter">("all");
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  useEffect(() => {
    params.then(({ id }) => setWorkId(id));
  }, [params]);

  useEffect(() => {
    if (!workId) return;
    fetch(`/api/admin/works/${workId}`)
      .then(r => r.json())
      .then(d => { setWorkSlug(d.slug); setWorkTitle(d.title); });
  }, [workId]);

  const fetchEpisodes = useCallback(() => {
    if (!workId) return;
    setLoading(true);
    const qs = new URLSearchParams({ page: String(page), q, kind });
    fetch(`/api/admin/works/${workId}/episodes?${qs}`)
      .then(r => r.json())
      .then(d => { setData(d); setEpisodes(d.episodes); setLoading(false); })
      .catch(() => setLoading(false));
  }, [workId, page, q, kind]);

  useEffect(() => { fetchEpisodes(); }, [fetchEpisodes]);

  function handleSaved(id: number, title: string | null) {
    setEpisodes(prev => prev.map(e => e.id === id ? { ...e, title } : e));
  }

  function handleDeleted(id: number) {
    setEpisodes(prev => prev.filter(e => e.id !== id));
    setData(prev => prev ? { ...prev, total: prev.total - 1 } : prev);
  }

  const isManga = data?.workType === "manga";

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/admin/works/${workId}`} className="text-sm text-gray-400 hover:text-gray-600">← 編集に戻る</Link>
        <h1 className="text-xl font-bold">{workTitle} — サブタイトル編集</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        {/* 絞り込み */}
        <div className="flex gap-2 flex-wrap">
          {isManga && (
            <>
              {(["all", "volume", "chapter"] as const).map(k => (
                <button
                  key={k}
                  onClick={() => { setKind(k); setPage(1); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    kind === k ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-600 hover:border-indigo-300"
                  }`}
                >
                  {k === "all" ? "すべて" : k === "volume" ? "巻" : "話"}
                </button>
              ))}
            </>
          )}
          <input
            value={q}
            onChange={e => { setQ(e.target.value); setPage(1); }}
            placeholder="番号・タイトルで絞り込み..."
            className="flex-1 min-w-[180px] border border-gray-200 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        {/* カウント */}
        {data && (
          <p className="text-xs text-gray-500">
            計{data.total.toLocaleString()}件
            {data.pages > 1 && <span className="ml-1">（{page}/{data.pages}ページ）</span>}
          </p>
        )}

        {/* エピソード一覧 */}
        {loading ? (
          <p className="text-sm text-gray-400 py-8 text-center">読み込み中...</p>
        ) : (
          <div>
            {episodes.map(ep => (
              <EpisodeRow key={ep.id} ep={ep} workSlug={workSlug} onSaved={handleSaved} onDeleted={handleDeleted} />
            ))}
          </div>
        )}

        {/* ページネーション */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:border-indigo-300"
            >
              ← 前
            </button>
            {Array.from({ length: data.pages }, (_, i) => i + 1)
              .filter(n => n === 1 || n === data.pages || Math.abs(n - page) <= 2)
              .reduce<(number | "…")[]>((acc, n, idx, arr) => {
                if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("…");
                acc.push(n);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "…" ? (
                  <span key={`e${idx}`} className="text-gray-400 text-sm px-1">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item as number)}
                    className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                      page === item ? "bg-indigo-600 text-white" : "border border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            <button
              onClick={() => setPage(p => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:border-indigo-300"
            >
              次 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
