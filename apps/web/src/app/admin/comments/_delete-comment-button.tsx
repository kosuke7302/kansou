"use client";

import { useTransition } from "react";
import { deleteComment } from "@/app/actions/comments";

export function DeleteCommentButton({ commentId }: { commentId: number }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("このコメントを削除しますか？返信も一緒に削除され、元に戻せません。")) return;
    startTransition(() => {
      deleteComment(commentId);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="shrink-0 text-xs text-red-500 hover:text-white hover:bg-red-500 border border-red-200 rounded px-2 py-1 disabled:opacity-50"
    >
      {isPending ? "削除中..." : "削除"}
    </button>
  );
}
