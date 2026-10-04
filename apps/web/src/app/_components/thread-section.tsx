"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createThread, type ThreadActionState } from "@/app/actions/threads";

export type ThreadListItem = {
  id: number;
  title: string;
  authorName: string;
  createdAt: string | Date;
  commentCount: number;
};

const initialState: ThreadActionState = {};

export function ThreadSection({ slug, threads }: { slug: string; threads: ThreadListItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createThread, initialState);

  useEffect(() => {
    if (state.success && state.threadId) {
      router.push(`/works/${slug}/threads/${state.threadId}`);
    }
  }, [state.success, state.threadId, slug, router]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-head text-base font-semibold">スレッド</h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-sm text-accent-600 border border-accent-200 rounded-card px-3 py-1.5 hover:bg-accent-50 transition-colors"
        >
          {open ? "閉じる" : "スレを立てる"}
        </button>
      </div>

      {open && (
        <form action={action} className="bg-white border border-line rounded-card p-4 space-y-2">
          <input type="hidden" name="slug" value={slug} />
          {state.error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-card px-3 py-2">{state.error}</p>
          )}
          <input
            name="title"
            maxLength={100}
            placeholder="スレのタイトル（例: ラーメンマンの正体を考察）"
            required
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
      )}

      {threads.length === 0 ? (
        <p className="text-sm text-ink-muted py-4">まだスレッドはありません。最初のスレを立ててみてください。</p>
      ) : (
        <ul className="grid gap-2">
          {threads.map((t) => (
            <li key={t.id}>
              <Link
                href={`/works/${slug}/threads/${t.id}`}
                className="flex items-center justify-between gap-3 bg-white rounded-card border border-line px-4 py-3 hover:border-accent-300 transition-all"
              >
                <span className="font-medium truncate min-w-0">{t.title}</span>
                <span className="shrink-0 text-xs text-ink-muted">{t.commentCount}件</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
