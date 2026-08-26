"use client";

import { useState, useTransition } from "react";
import { updateRequestStatus } from "@/app/actions/work-requests";

const STATUS_OPTIONS = [
  { value: "pending", label: "未対応" },
  { value: "in_progress", label: "対応中" },
  { value: "added", label: "追加済み" },
  { value: "rejected", label: "却下" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  in_progress: "bg-amber-100 text-amber-700",
  added: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-500",
};

export function StatusSelect({
  requestId,
  currentStatus,
}: {
  requestId: number;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as (typeof STATUS_OPTIONS)[number]["value"];
    setStatus(next);
    startTransition(async () => {
      await updateRequestStatus(requestId, next);
    });
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={isPending}
      className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50 ${STATUS_STYLES[status]}`}
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
