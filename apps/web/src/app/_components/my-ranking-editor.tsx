"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { saveMyRanking, type MyRankingEntry } from "@/app/actions/ranking";
import { ShareButtons } from "./share-buttons";

const TYPE_LABELS: Record<string, string> = {
  anime: "アニメ", manga: "漫画", drama: "ドラマ", movie: "映画",
};
const TYPE_STYLES: Record<string, string> = {
  anime: "bg-purple-100 text-purple-700",
  manga: "bg-blue-100 text-blue-700",
  drama: "bg-green-100 text-green-700",
  movie: "bg-orange-100 text-orange-700",
};

const MAX_ENTRIES = 5;

type Candidate = { workId: number; slug: string; title: string; type: string };

type Props = {
  favorites: Candidate[];
  initialRanking: MyRankingEntry[];
  initialShareId: string | null;
};

export function MyRankingEditor({ favorites, initialRanking, initialShareId }: Props) {
  const [selected, setSelected] = useState<Candidate[]>(
    initialRanking.map((r) => ({ workId: r.workId, slug: r.slug, title: r.title, type: r.type }))
  );
  const [shareId, setShareId] = useState<string | null>(initialShareId);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedIds = new Set(selected.map((s) => s.workId));
  const remainingFavorites = favorites.filter((f) => !selectedIds.has(f.workId));

  function addWork(work: Candidate) {
    if (selected.length >= MAX_ENTRIES) return;
    setSelected((prev) => [...prev, work]);
  }

  function removeWork(workId: number) {
    setSelected((prev) => prev.filter((w) => w.workId !== workId));
  }

  function move(index: number, direction: -1 | 1) {
    setSelected((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const res = await saveMyRanking(selected.map((s) => s.workId));
      if (res.error) {
        setError(res.error);
      } else if (res.shareId) {
        setShareId(res.shareId);
      }
    });
  }

  const shareUrl = shareId && typeof window !== "undefined" ? `${window.location.origin}/ranking/${shareId}` : null;

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">TOP{MAX_ENTRIES}（{selected.length}/{MAX_ENTRIES}）</h2>
        {selected.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center bg-white border border-gray-200 rounded-lg">
            下の一覧から作品を選んで追加してください
          </p>
        ) : (
          <div className="grid gap-2">
            {selected.map((work, i) => (
              <div
                key={work.workId}
                className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2.5"
              >
                <span className="w-6 text-center text-sm font-bold text-indigo-500 shrink-0">{i + 1}</span>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[work.type]}`}>
                  {TYPE_LABELS[work.type]}
                </span>
                <span className="font-medium truncate min-w-0 flex-1">{work.title}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="上に移動"
                    className="w-8 h-8 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:text-indigo-600"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === selected.length - 1}
                    aria-label="下に移動"
                    className="w-8 h-8 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:text-indigo-600"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeWork(work.workId)}
                    aria-label="削除"
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || selected.length === 0}
          className="min-h-12 bg-indigo-600 text-white text-sm font-medium px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isPending ? "保存中..." : "保存する"}
        </button>
      </section>

      {shareId && (
        <section className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 space-y-2">
          <p className="text-sm text-indigo-700 font-medium">ランキングをシェアしよう！</p>
          <Link href={`/ranking/${shareId}`} className="text-sm text-indigo-600 hover:underline break-all">
            {shareUrl ?? `/ranking/${shareId}`}
          </Link>
          {shareUrl && <ShareButtons title="私のアニメ・漫画ランキングTOP5" url={shareUrl} />}
        </section>
      )}

      {remainingFavorites.length > 0 && selected.length < MAX_ENTRIES && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold">お気に入りから追加</h2>
          <div className="grid gap-2">
            {remainingFavorites.map((work) => (
              <button
                key={work.workId}
                type="button"
                onClick={() => addWork(work)}
                className="flex items-center gap-2 min-w-0 bg-white rounded-lg border border-gray-200 px-4 py-3 text-left hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[work.type]}`}>
                  {TYPE_LABELS[work.type]}
                </span>
                <span className="font-medium truncate min-w-0 flex-1">{work.title}</span>
                <span className="text-indigo-500 text-sm shrink-0">+ 追加</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {favorites.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">
          お気に入り登録した作品がまだありません。
          <Link href="/favorites" className="text-indigo-500 hover:underline ml-1">
            お気に入りを見る
          </Link>
        </p>
      )}
    </div>
  );
}
