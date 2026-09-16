"use client";

import { useEffect, useState } from "react";

// スマホ幅のみ表示する「コメントを入力」固定ボタン。タップでコメントフォームまで
// スクロールし、フォームが画面内に入ったら自動的に隠れる（投稿ボタンと重ならないように）
export function MobileCommentCta({ targetId = "comment-form" }: { targetId?: string }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  function handleClick() {
    const target = document.getElementById(targetId);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    const textarea = target.querySelector("textarea");
    if (textarea) {
      window.setTimeout(() => textarea.focus(), 400);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`sm:hidden fixed left-4 right-4 z-30 min-h-12 bg-indigo-600 text-white text-sm font-semibold rounded-full shadow-lg flex items-center justify-center gap-1.5 transition-opacity ${
        hidden ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      💬 コメントを入力
    </button>
  );
}
