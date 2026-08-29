"use client";

import { useState, useTransition } from "react";
import { linkRequestToWork } from "@/app/actions/work-requests";

export function LinkWork({
  requestId,
  linkedTitle,
  linkedSlug,
}: {
  requestId: number;
  linkedTitle: string | null;
  linkedSlug: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [slugInput, setSlugInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await linkRequestToWork(requestId, slugInput);
      if (result.error) {
        setError(result.error);
      } else {
        setEditing(false);
        setSlugInput("");
      }
    });
  }

  function handleUnlink() {
    startTransition(async () => {
      await linkRequestToWork(requestId, "");
    });
  }

  if (linkedSlug) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <a href={`/works/${linkedSlug}`} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
          → {linkedTitle}
        </a>
        <button onClick={handleUnlink} disabled={isPending} className="text-gray-400 hover:text-red-500 disabled:opacity-50">
          解除
        </button>
      </div>
    );
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-gray-400 hover:text-indigo-500 border border-gray-200 rounded px-2 py-0.5"
      >
        作品を紐付け
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1">
      <input
        value={slugInput}
        onChange={(e) => setSlugInput(e.target.value)}
        placeholder="作品のスラグ"
        disabled={isPending}
        className="text-xs border border-gray-200 rounded px-2 py-0.5 w-28 focus:outline-none focus:ring-1 focus:ring-indigo-300"
      />
      <button type="submit" disabled={isPending} className="text-xs text-indigo-500 hover:underline disabled:opacity-50">
        {isPending ? "..." : "OK"}
      </button>
      <button
        type="button"
        onClick={() => { setEditing(false); setError(null); }}
        className="text-xs text-gray-400 hover:underline"
      >
        キャンセル
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </form>
  );
}
