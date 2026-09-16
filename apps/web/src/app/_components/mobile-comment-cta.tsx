"use client";

// スマホ幅のみ表示する「コメントを入力」固定ボタン。タップでコメントフォームまでスクロールする。
// コメント件数によってページの長さが変わり、フォームが最初から画面内に入っていることもあるため、
// 表示・非表示は出し分けずページごとに常に同じ場所に表示する
export function MobileCommentCta({ targetId = "comment-form" }: { targetId?: string }) {
  function handleClick() {
    const target = document.getElementById(targetId);
    if (!target) return;
    // ユーザー操作(クリック)と同じ呼び出しスタック内でfocus()を呼ばないと、
    // スマホブラウザがソフトキーボードを表示してくれないため、setTimeoutは使わない
    const textarea = target.querySelector("textarea");
    textarea?.focus();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="sm:hidden fixed left-4 right-4 z-30 min-h-12 bg-indigo-600 text-white text-sm font-semibold rounded-full shadow-lg flex items-center justify-center gap-1.5"
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      💬 コメントを入力
    </button>
  );
}
