"use client";

import { useActionState } from "react";
import { submitWorkRequest, type WorkRequestActionState } from "@/app/actions/work-requests";

const initialState: WorkRequestActionState = {};

export function RequestForm({ defaultTitle = "" }: { defaultTitle?: string }) {
  const [state, action, pending] = useActionState(submitWorkRequest, initialState);

  if (state.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-2">
        <p className="text-green-700 font-medium">リクエストを受け付けました</p>
        <p className="text-sm text-green-600">追加を検討のうえ、順次サイトに反映いたします。</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <form action={action} className="space-y-4">
        {state.error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
        )}

        <div className="space-y-1">
          <label htmlFor="title" className="text-sm font-medium text-gray-700">
            作品名 <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={255}
            defaultValue={defaultTitle}
            placeholder="例：〇〇〇〇"
            disabled={pending}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="type" className="text-sm font-medium text-gray-700">
            ジャンル
            <span className="text-gray-400 text-xs font-normal ml-1">（わかれば）</span>
          </label>
          <select
            id="type"
            name="type"
            defaultValue=""
            disabled={pending}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
          >
            <option value="">指定なし</option>
            <option value="anime">アニメ</option>
            <option value="manga">漫画</option>
            <option value="drama">ドラマ</option>
            <option value="movie">映画</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="note" className="text-sm font-medium text-gray-700">
            補足
            <span className="text-gray-400 text-xs font-normal ml-1">（配信先、シリーズ名など）</span>
          </label>
          <textarea
            id="note"
            name="note"
            rows={4}
            maxLength={1000}
            placeholder="任意でご記入ください"
            disabled={pending}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="requesterName" className="text-sm font-medium text-gray-700">
            お名前
            <span className="text-gray-400 text-xs font-normal ml-1">（省略可）</span>
          </label>
          <input
            id="requesterName"
            name="requesterName"
            type="text"
            maxLength={100}
            placeholder="ニックネームでも可"
            disabled={pending}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {pending ? "送信中..." : "リクエストを送信する"}
        </button>
      </form>
    </div>
  );
}
