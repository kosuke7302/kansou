"use client";

import { useActionState, useEffect, useRef } from "react";
import { postThreadComment, type ThreadActionState } from "@/app/actions/threads";

const initialState: ThreadActionState = {};

export function ThreadCommentForm({ slug, threadId }: { slug: string; threadId: number }) {
  const [state, action, pending] = useActionState(postThreadComment, initialState);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state.success && textareaRef.current) textareaRef.current.value = "";
  }, [state.success]);

  return (
    <section className="bg-white border border-line rounded-card p-4 space-y-2">
      <h2 className="font-head text-sm font-semibold">書き込む</h2>
      <form action={action} className="space-y-2">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="threadId" value={threadId} />
        {state.error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-card px-3 py-2">{state.error}</p>
        )}
        <input
          name="authorName"
          defaultValue="名前未設定"
          maxLength={100}
          disabled={pending}
          className="w-full text-base border border-line rounded-card px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-300"
        />
        <textarea
          ref={textareaRef}
          name="body"
          rows={3}
          maxLength={1000}
          required
          placeholder="書き込みを入力"
          disabled={pending}
          className="w-full text-base border border-line rounded-card px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-accent-300"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-accent-600 text-white text-sm font-medium px-4 py-2 rounded-card hover:bg-accent-700 disabled:opacity-50"
        >
          {pending ? "投稿中..." : "書き込む"}
        </button>
      </form>
    </section>
  );
}
