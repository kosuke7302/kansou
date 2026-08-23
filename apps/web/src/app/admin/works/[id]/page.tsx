"use client";

import { useActionState, useEffect, useState } from "react";
import { updateWork, type AddWorkState } from "@/app/actions/admin";
import Link from "next/link";

const initialState: AddWorkState = {};

const TYPE_LABELS: Record<string, string> = {
  manga: "漫画", anime: "アニメ", drama: "ドラマ", movie: "映画",
};

type Work = {
  id: number;
  title: string;
  slug: string;
  type: string;
  platform: string | null;
  description: string | null;
  keywords: string | null;
  episodeCount: number;
  volumeCount: number;
  chapterCount: number;
};

export default function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const [state, action, pending] = useActionState(updateWork, initialState);
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ id }) => {
      fetch(`/api/admin/works/${id}`)
        .then(r => r.json())
        .then(data => { setWork(data); setLoading(false); })
        .catch(() => setLoading(false));
    });
  }, [params]);

  if (loading) return <div className="text-sm text-gray-400">読み込み中...</div>;
  if (!work) return <div className="text-sm text-red-500">作品が見つかりません</div>;

  const isManga = work.type === "manga";
  const isMovie = work.type === "movie";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/works" className="text-sm text-gray-400 hover:text-gray-600">← 一覧</Link>
        <h1 className="text-xl font-bold">{work.title} を編集</h1>
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{TYPE_LABELS[work.type]}</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form action={action} className="space-y-5">
          <input type="hidden" name="id" value={work.id} />

          {state.error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
          )}
          {state.success && (
            <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">{state.success}</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">タイトル *</label>
              <input
                name="title"
                defaultValue={work.title}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                disabled={pending}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">スラグ</label>
              <input
                value={work.slug}
                readOnly
                className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-400 font-mono"
              />
              <p className="text-xs text-gray-400 mt-0.5">※URLに使用されるため変更不可</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">配信プラットフォーム</label>
              <select
                name="platform"
                defaultValue={work.platform ?? ""}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                disabled={pending}
              >
                <option value="">なし</option>
                <option value="netflix">Netflix</option>
                <option value="amazon_prime">Amazon Prime Video</option>
                <option value="disney_plus">Disney+</option>
                <option value="hulu">Hulu</option>
                <option value="u_next">U-NEXT</option>
                <option value="d_anime">dアニメストア</option>
                <option value="abema">ABEMA</option>
                <option value="lemino">Lemino</option>
                <option value="fod">FOD Premium</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">説明</label>
              <textarea
                name="description"
                defaultValue={work.description ?? ""}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                disabled={pending}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                検索キーワード
                <span className="text-gray-400 font-normal ml-1">（スペース区切り）</span>
              </label>
              <input
                name="keywords"
                defaultValue={work.keywords ?? ""}
                placeholder="例: shingeki aot 巨人 諫山創 進撃"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                disabled={pending}
              />
              <p className="text-xs text-gray-400 mt-0.5">
                作品ページのURLに含まれない別名・英語名・作者名などを登録するとサイト内検索でヒットします
              </p>
            </div>
          </div>

          {/* 話数・巻数追加 */}
          {!isMovie && (
            <div className="border-t border-gray-100 pt-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                {isManga ? "巻・話を追加" : "話数を追加"}
                <span className="text-gray-400 font-normal ml-2 text-xs">
                  （現在: {isManga ? `${work.volumeCount}巻 / ${work.chapterCount}話` : `${work.episodeCount}話`}）
                </span>
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {!isManga && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">追加する話数</label>
                    <input
                      name="addEpisodes"
                      type="number"
                      min="0"
                      defaultValue="0"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      disabled={pending}
                    />
                  </div>
                )}
                {isManga && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">追加する巻数</label>
                      <input
                        name="addVolumes"
                        type="number"
                        min="0"
                        defaultValue="0"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        disabled={pending}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">追加する話数</label>
                      <input
                        name="addChapters"
                        type="number"
                        min="0"
                        defaultValue="0"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        disabled={pending}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={pending}
              className="bg-indigo-600 text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {pending ? "保存中..." : "保存"}
            </button>
            <Link
              href={`/admin/works/${work.id}/episodes`}
              className="text-sm text-gray-500 border border-gray-200 rounded-lg px-4 py-2 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
            >
              サブタイトルを編集
            </Link>
            <Link
              href={`/works/${work.slug}`}
              target="_blank"
              className="text-sm text-indigo-500 hover:underline"
            >
              作品ページを確認 →
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
