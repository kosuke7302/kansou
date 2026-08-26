"use client";

import { useActionState } from "react";
import { updateNickname } from "@/app/actions/profile";

type State = { error?: string };
const initialState: State = {};

export function NicknameForm({ currentName }: { currentName: string }) {
  const [state, action, pending] = useActionState(
    async (_prev: State, formData: FormData) => updateNickname(formData.get("nickname")?.toString() ?? ""),
    initialState
  );

  return (
    <form action={action} className="space-y-3 bg-white border border-gray-200 rounded-lg p-4">
      <label className="block text-sm font-semibold">ニックネーム</label>
      <p className="text-xs text-gray-500">
        ここで設定すると、コメント投稿時のニックネーム欄に毎回自動で入力されます。
      </p>
      {state.error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}
      <div className="flex gap-2">
        <input
          name="nickname"
          defaultValue={currentName}
          maxLength={100}
          disabled={pending}
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {pending ? "保存中..." : "保存"}
        </button>
      </div>
    </form>
  );
}
