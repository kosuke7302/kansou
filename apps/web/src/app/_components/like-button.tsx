"use client";

import { useState, useEffect } from "react";
import { likeComment, unlikeComment } from "@/app/actions/comments";

type Props = { commentId: number; initialCount: number };

export function LikeButton({ commentId, initialCount }: Props) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(localStorage.getItem(`kansou_like_${commentId}`) === "1");
  }, [commentId]);

  function handleClick() {
    if (liked) {
      setCount((c) => Math.max(0, c - 1));
      setLiked(false);
      localStorage.removeItem(`kansou_like_${commentId}`);
      unlikeComment(commentId);
    } else {
      setCount((c) => c + 1);
      setLiked(true);
      localStorage.setItem(`kansou_like_${commentId}`, "1");
      likeComment(commentId);
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
        liked
          ? "text-red-400 bg-red-50"
          : "text-gray-400 hover:text-red-400 hover:bg-red-50"
      }`}
    >
      <span>{liked ? "♥" : "♡"}</span>
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
