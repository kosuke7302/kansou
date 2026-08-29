"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { signIn } from "next-auth/react";
import { rateEpisode } from "@/app/actions/ratings";

export function EpisodeRating({
  episodeId,
  averageRating,
  ratingCount,
  myRating,
  isLoggedIn,
}: {
  episodeId: number;
  averageRating: number;
  ratingCount: number;
  myRating: number | null;
  isLoggedIn: boolean;
}) {
  const pathname = usePathname();
  const [rating, setRating] = useState(myRating);
  const [hover, setHover] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick(value: number) {
    if (!isLoggedIn) {
      signIn("google", { callbackUrl: pathname });
      return;
    }
    if (isPending) return;
    setRating(value);
    startTransition(async () => {
      await rateEpisode(episodeId, value, pathname);
    });
  }

  const displayValue = hover ?? rating ?? 0;

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm font-semibold">この話数を評価する</p>
        {ratingCount > 0 && (
          <p className="text-xs text-gray-400">
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
            <span className={value <= displayValue ? "text-amber-400" : "text-gray-200"}>★</span>
          </button>
        ))}
        {rating !== null && (
          <span className="text-xs text-gray-400 ml-2">あなたの評価: {rating}</span>
        )}
      </div>
    </section>
  );
}
