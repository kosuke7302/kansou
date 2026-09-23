"use client";

import { useState } from "react";

// スマホ幅のみ表示する「コメントを入力」固定ボタン。コメントフォーム自体はスマホでは
// 最初は隠れており(CommentForm/WorkCommentFormのmax-sm:hidden)、タップして初めて
// 表示・フォーカスされる。表示させたらボタン自身は用済みなので消える
export function MobileCommentCta({ targetId = "comment-form" }: { targetId?: string }) {
  const [pressed, setPressed] = useState(false);

  function handleClick() {
    const target = document.getElementById(targetId);
    if (!target) return;
    target.classList.remove("max-sm:hidden");
    // ユーザー操作(クリック)と同じ呼び出しスタック内でfocus()を呼ばないと、
    // スマホブラウザがソフトキーボードを表示してくれないため、setTimeoutは使わない
    const textarea = target.querySelector("textarea");
    textarea?.focus();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setPressed(true);
  }

  if (pressed) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      className="sm:hidden fixed left-4 right-4 z-30 min-h-12 bg-indigo-600 text-white text-sm font-semibold rounded-full shadow-lg flex items-center justify-center gap-1.5"
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      コメントを入力
    </button>
  );
}
