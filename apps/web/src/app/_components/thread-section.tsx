"use client";

import { useState } from "react";
import Link from "next/link";
import { ThreadCreateForm } from "./thread-create-form";

export type ThreadListItem = {
  id: number;
  title: string;
  authorName: string;
  createdAt: string | Date;
  commentCount: number;
};

export function ThreadSection({ slug, threads }: { slug: string; threads: ThreadListItem[] }) {
  const [open, setOpen] = useState(false);

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

      {open && <ThreadCreateForm slug={slug} />}

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
