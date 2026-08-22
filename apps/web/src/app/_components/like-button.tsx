"use client";

import { useState, useEffect } from "react";
import { likeComment } from "@/app/actions/comments";

type Props = { commentId: number; initialCount: number };

export function LikeButton({ commentId, initialCount }: Props) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(localStorage.getItem(`kansou_like_${commentId}`) === "1");
  }, [commentId]);

  function handleLike() {
    if (liked) return;
    setCount((c) => c + 1);
    setLiked(true);
    localStorage.setItem(`kansou_like_${commentId}`, "1");
    likeComment(commentId);
  }

  return (
    <button
      onClick={handleLike}
      disabled={liked}
      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
        liked
          ? "text-red-400 bg-red-50 cursor-default"
          : "text-gray-400 hover:text-red-400 hover:bg-red-50"
      }`}
    >
      <span>♥</span>
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
