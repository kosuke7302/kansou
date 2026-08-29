"use client";

import { useTransition } from "react";
import { deleteContactMessage } from "@/app/actions/contact";

export function DeleteContactButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("このお問い合わせを削除しますか？元に戻せません。")) return;
    startTransition(() => {
      deleteContactMessage(id);
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
