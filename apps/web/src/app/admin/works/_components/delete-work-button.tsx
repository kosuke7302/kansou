"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteWork } from "@/app/actions/admin";

export function DeleteWorkButton({
  workId,
  title,
  redirectTo,
  className,
}: {
  workId: number;
  title: string;
  redirectTo?: string;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm(`「${title}」を削除しますか？話数・コメントも全て削除され、元に戻せません。`)) return;
    startTransition(async () => {
      const res = await deleteWork(workId);
      if (res.error) {
        alert(res.error);
        return;
      }
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className={
        className ??
        "text-xs text-red-500 hover:text-white hover:bg-red-500 border border-red-200 rounded px-2 py-1 disabled:opacity-50"
      }
    >
      {isPending ? "削除中..." : "削除"}
    </button>
  );
}
