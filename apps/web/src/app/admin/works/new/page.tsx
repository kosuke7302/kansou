"use client";

import { useActionState, useState, useEffect } from "react";
import { addWork, bulkAddWorks, type AddWorkState } from "@/app/actions/admin";

const initialState: AddWorkState = {};

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function NewWorkPage() {
  const [tab, setTab] = useState<"single" | "bulk">("single");
  const [singleState, singleAction, singlePending] = useActionState(addWork, initialState);
  const [bulkState, bulkAction, bulkPending] = useActionState(bulkAddWorks, initialState);
  const [type, setType] = useState("anime");
  const [titleInput, setTitleInput] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [slugManual, setSlugManual] = useState(false);

  useEffect(() => {
    if (!slugManual) setSlugInput(toSlug(titleInput));
  }, [titleInput, slugManual]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">作品追加</h1>

      <div className="flex gap-2 border-b border-gray-200">
        {(["single", "bulk"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "single" ? "1件ずつ" : "一括登録"}
          </button>
        ))}
      </div>

      {tab === "single" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <form action={singleAction} className="space-y-5">
            {singleState.error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 whitespace-pre-wrap">{singleState.error}</p>
            )}
            {singleState.success && (
              <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">{singleState.success}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">タイトル *</label>
                <input
                  name="title"
                  value={titleInput}
                  onChange={e => setTitleInput(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  disabled={singlePending}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  スラグ * <span className="text-gray-400 font-normal">（URL用・英数字とハイフン）</span>
                </label>
                <input
                  name="slug"
                  value={slugInput}
                  onChange={e => { setSlugManual(true); setSlugInput(e.target.value); }}
                  required
                  placeholder="例: attack-on-titan"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  disabled={singlePending}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ジャンル *</label>
                <select
                  name="type"
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  disabled={singlePending}
                >
                  <option value="anime">アニメ</option>
                  <option value="manga">漫画</option>
                  <option value="drama">ドラマ</option>
                  <option value="movie">映画</option>
                </select>
              </div>

              {type !== "movie" && type !== "manga" && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">話数 *</label>
                  <input
                    name="episodeCount"
                    type="number"
                    min="1"
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    disabled={singlePending}
                  />
                </div>
              )}

              {type === "manga" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">巻数 *</label>
                    <input
                      name="volumeCount"
                      type="number"
                      min="1"
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      disabled={singlePending}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      話数 <span className="text-gray-400 font-normal">（省略可）</span>
                    </label>
                    <input
                      name="chapterCount"
                      type="number"
                      min="0"
                      defaultValue="0"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      disabled={singlePending}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">配信プラットフォーム</label>
                <select
                  name="platform"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  disabled={singlePending}
                >
                  <option value="">なし</option>
                  <option value="netflix">Netflix</option>
                  <option value="amazon_prime">Amazon Prime Video</option>
                  <option value="disney_plus">Disney+</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">説明</label>
                <textarea
                  name="description"
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  disabled={singlePending}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={singlePending}
              className="bg-indigo-600 text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {singlePending ? "追加中..." : "作品を追加"}
            </button>
          </form>
        </div>
      )}

      {tab === "bulk" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-4">
            1行1作品でカンマ区切りで入力してください。<br />
            形式: <code className="bg-gray-100 px-1 rounded">タイトル,ジャンル,話数(漫画は巻数),スラグ[,プラットフォーム]</code><br />
            ジャンル: <code className="bg-gray-100 px-1 rounded">anime</code> /
            <code className="bg-gray-100 px-1 rounded ml-1">manga</code> /
            <code className="bg-gray-100 px-1 rounded ml-1">drama</code> /
            <code className="bg-gray-100 px-1 rounded ml-1">movie</code>
          </p>
          <form action={bulkAction} className="space-y-4">
            {bulkState.error && (
              <pre className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 whitespace-pre-wrap">{bulkState.error}</pre>
            )}
            {bulkState.success && (
              <pre className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2 whitespace-pre-wrap">{bulkState.success}</pre>
            )}
            <textarea
              name="works"
              rows={16}
              placeholder={`魔王,drama,11,maou\n鍵のかかった部屋,drama,10,locked-room-drama\n信長協奏曲,drama,11,nobunaga-concerto\nMonster,manga,18,monster-manga`}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-indigo-300"
              disabled={bulkPending}
            />
            <button
              type="submit"
              disabled={bulkPending}
              className="bg-indigo-600 text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {bulkPending ? "登録中..." : "一括登録"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
