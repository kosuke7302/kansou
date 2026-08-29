"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { toggleFavorite, getFavoriteStatus } from "@/app/actions/favorites";

export function FavoriteButton({
  workId,
  slug,
}: {
  workId: number;
  slug: string;
}) {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const [favorited, setFavorited] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoggedIn) {
      getFavoriteStatus(workId).then(setFavorited);
    }
  }, [isLoggedIn, workId]);

  function handleClick() {
    if (!isLoggedIn) {
      signIn("google", { callbackUrl: pathname });
      return;
    }
    startTransition(async () => {
      const res = await toggleFavorite(workId, slug);
      if (!res.error) setFavorited((prev) => !prev);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`shrink-0 flex items-center gap-1 text-sm px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${
        favorited
          ? "bg-pink-50 border-pink-200 text-pink-600"
          : "bg-white border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-500"
      }`}
    >
      <span>{favorited ? "♥" : "♡"}</span>
      <span>{favorited ? "お気に入り済み" : "お気に入り"}</span>
    </button>
  );
}
