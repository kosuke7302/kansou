"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { requestNextEpisode } from "@/app/actions/episode-add-requests";

type Field = "episode" | "volume";

type Props = {
  slug: string;
  workId: number;
  field: Field;
  currentNumber: number;
  prevNumber: number | null;
  nextExists: boolean;
};

function labelFor(field: Field, n: number) {
  return field === "episode" ? `第${n}話` : `第${n}巻`;
}

function hrefFor(slug: string, field: Field, n: number) {
  return field === "episode" ? `/works/${slug}/episodes/${n}` : `/works/${slug}/volumes/${n}`;
}

export function EpisodeNav({ slug, workId, field, currentNumber, prevNumber, nextExists }: Props) {
  const nextNumber = currentNumber + 1;
  const storageKey = `kansou_ep_request_${workId}_${field}_${nextNumber}`;
  const [requested, setRequested] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (localStorage.getItem(storageKey)) setRequested(true);
  }, [storageKey]);

  function handleRequest() {
    startTransition(async () => {
      const res = await requestNextEpisode(workId, field, nextNumber);
      if (!res.error) {
        localStorage.setItem(storageKey, "1");
        setRequested(true);
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-2 text-sm border-t border-b border-paper-soft py-3">
      {prevNumber !== null ? (
        <Link href={hrefFor(slug, field, prevNumber)} className="text-accent-500 hover:underline">
          ← {labelFor(field, prevNumber)}
        </Link>
      ) : (
        <span className="text-xs text-line">これが最初です</span>
      )}

      {nextExists ? (
        <Link href={hrefFor(slug, field, nextNumber)} className="text-accent-500 hover:underline">
          {labelFor(field, nextNumber)} →
        </Link>
      ) : requested ? (
        <span className="text-xs text-ink-muted">リクエスト済みです。追加をお待ちください</span>
      ) : (
        <button
          onClick={handleRequest}
          disabled={isPending}
          className="text-xs bg-paper-soft hover:bg-line text-ink-soft px-3 py-1.5 rounded-full disabled:opacity-50 shrink-0"
        >
          {isPending ? "送信中..." : `${labelFor(field, nextNumber)}をリクエストする`}
        </button>
      )}
    </div>
  );
}
