"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { rateEpisode, getMyRating } from "@/app/actions/ratings";

export function EpisodeRating({
  episodeId,
  averageRating,
  ratingCount,
}: {
  episodeId: number;
  averageRating: number;
  ratingCount: number;
}) {
  const pathname = usePathname();
  const [rating, setRating] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getMyRating(episodeId).then(setRating);
  }, [episodeId]);

  function handleClick(value: number) {
    if (isPending) return;
    setRating(value);
    startTransition(async () => {
      await rateEpisode(episodeId, value, pathname);
    });
  }

  const displayValue = hover ?? rating ?? 0;

  return (
    <section className="bg-white border border-line rounded-card p-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm font-semibold">この話数を評価する</p>
        {ratingCount > 0 && (
          <p className="text-xs text-ink-muted">
            平均 {averageRating.toFixed(1)}（{ratingCount}件）
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 mt-2" onMouseLeave={() => setHover(null)}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => handleClick(value)}
            onMouseEnter={() => setHover(value)}
            disabled={isPending}
            aria-label={`${value}点`}
            className="text-2xl leading-none disabled:opacity-60"
          >
            <span className={value <= displayValue ? "text-amber-400" : "text-line"}>★</span>
          </button>
        ))}
        {rating !== null && (
          <span className="text-xs text-ink-muted ml-2">あなたの評価: {rating}</span>
        )}
      </div>
    </section>
  );
}
