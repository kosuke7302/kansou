"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { addReaction, removeReaction } from "@/app/actions/reactions";
import type { ReactionType } from "@/lib/reaction-types";

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "cry", emoji: "😭", label: "泣いた" },
  { type: "laugh", emoji: "😂", label: "笑った" },
  { type: "shock", emoji: "😱", label: "衝撃" },
  { type: "hype", emoji: "🔥", label: "神回" },
  { type: "angry", emoji: "😡", label: "イライラ" },
];

export function EpisodeReactions({
  episodeId,
  episodeLabel,
  initialCounts,
}: {
  episodeId: number;
  episodeLabel: string;
  initialCounts: Record<ReactionType, number>;
}) {
  const pathname = usePathname();
  const [counts, setCounts] = useState(initialCounts);
  const [selected, setSelected] = useState<ReactionType | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const saved = localStorage.getItem(`kansou_reaction_${episodeId}`);
    if (saved && REACTIONS.some((r) => r.type === saved)) {
      setSelected(saved as ReactionType);
    }
  }, [episodeId]);

  function handleClick(type: ReactionType) {
    if (isPending || type === selected) return;
    const prev = selected;

    setCounts((c) => ({
      ...c,
      [type]: c[type] + 1,
      ...(prev ? { [prev]: Math.max(0, c[prev] - 1) } : {}),
    }));
    setSelected(type);
    localStorage.setItem(`kansou_reaction_${episodeId}`, type);

    startTransition(async () => {
      await addReaction(episodeId, type, pathname);
      if (prev) await removeReaction(episodeId, prev, pathname);
    });
  }

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-sm font-semibold mb-3">{episodeLabel}を見た人、どうだった？</p>
      <div className="flex gap-2 flex-wrap">
        {REACTIONS.map((r) => (
          <button
            key={r.type}
            onClick={() => handleClick(r.type)}
            disabled={isPending}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors disabled:opacity-60 ${
              selected === r.type
                ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"
            }`}
          >
            <span>{r.emoji}</span>
            <span>{r.label}</span>
            {counts[r.type] > 0 && <span className="text-xs text-gray-400">{counts[r.type]}</span>}
          </button>
        ))}
      </div>
    </section>
  );
}
