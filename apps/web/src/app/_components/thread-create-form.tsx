"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createThread, type ThreadActionState } from "@/app/actions/threads";

const initialState: ThreadActionState = {};

export function ThreadCreateForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createThread, initialState);

  useEffect(() => {
    if (state.success && state.threadId) {
      router.push(`/works/${slug}/threads/${state.threadId}`);
    }
  }, [state.success, state.threadId, slug, router]);

  return (
    <form action={action} className="bg-white border border-line rounded-card p-4 space-y-2">
      <input type="hidden" name="slug" value={slug} />
      {state.error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-card px-3 py-2">{state.error}</p>
      )}
      <input
        name="title"
        maxLength={100}
        required
        placeholder="スレのタイトル"
        className="w-full text-base border border-line rounded-card px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-300"
        disabled={pending}
      />
      <textarea
        name="body"
        rows={3}
        maxLength={1000}
        required
        placeholder="最初の書き込み"
        className="w-full text-base border border-line rounded-card px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-accent-300"
        disabled={pending}
      />
      <input
        name="authorName"
        defaultValue="名前未設定"
        maxLength={100}
        className="w-full text-base border border-line rounded-card px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-300"
        disabled={pending}
      />
      <button
        type="submit"
        disabled={pending}
        className="bg-accent-600 text-white text-sm font-medium px-4 py-2 rounded-card hover:bg-accent-700 disabled:opacity-50"
      >
        {pending ? "作成中..." : "スレを立てる"}
      </button>
    </form>
  );
}

