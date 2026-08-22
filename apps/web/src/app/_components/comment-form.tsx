"use client";

import { useActionState } from "react";
import { postComment, type CommentActionState } from "@/app/actions/comments";

const initialState: CommentActionState = {};

export function CommentForm({ slug, episodeNumber }: { slug: string; episodeNumber: number }) {
  const [state, action, pending] = useActionState(postComment, initialState);

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-4">
      <h2 className="text-sm font-semibold mb-3">感想を投稿する</h2>
      <form action={action} className="space-y-3">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="episodeNumber" value={episodeNumber} />

        {state.error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
        )}
        {state.success && (
          <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">投稿しました！</p>
        )}

        <textarea
          name="body"
          placeholder="感想を書いてください（ネタバレ注意）"
          rows={4}
          maxLength={1000}
          required
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
          disabled={pending}
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {pending ? "投稿中..." : "投稿する"}
        </button>
      </form>
    </section>
  );
}
