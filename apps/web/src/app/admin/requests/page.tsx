import { db } from "@/lib/db";
import { workRequests, works } from "@kansou/db";
import { desc, eq } from "drizzle-orm";
import { StatusSelect } from "./_status-select";
import { LinkWork } from "./_link-work";

const TYPE_LABELS: Record<string, string> = {
  anime: "アニメ", manga: "漫画", drama: "ドラマ", movie: "映画",
};

const STATUS_TABS = [
  { key: "all", label: "すべて" },
  { key: "pending", label: "未対応" },
  { key: "in_progress", label: "対応中" },
  { key: "added", label: "追加済み" },
  { key: "rejected", label: "却下" },
] as const;

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeTab = STATUS_TABS.some((t) => t.key === status) ? status! : "all";

  const rows = await db
    .select({
      id: workRequests.id,
      title: workRequests.title,
      type: workRequests.type,
      note: workRequests.note,
      requesterName: workRequests.requesterName,
      status: workRequests.status,
      createdAt: workRequests.createdAt,
      linkedWorkId: workRequests.linkedWorkId,
      linkedTitle: works.title,
      linkedSlug: works.slug,
    })
    .from(workRequests)
    .leftJoin(works, eq(works.id, workRequests.linkedWorkId))
    .where(activeTab === "all" ? undefined : eq(workRequests.status, activeTab as "pending" | "in_progress" | "added" | "rejected"))
    .orderBy(desc(workRequests.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">作品リクエスト</h1>
        <p className="text-sm text-gray-500 mt-1">計{rows.length}件</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <a
            key={tab.key}
            href={tab.key === "all" ? "/admin/requests" : `/admin/requests?status=${tab.key}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="text-gray-400 text-sm py-12 text-center">リクエストはありません</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {rows.map((r) => (
            <div key={r.id} className="px-4 py-3 space-y-1.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{r.title}</p>
                    {r.type && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        {TYPE_LABELS[r.type] ?? r.type}
                      </span>
                    )}
                  </div>
                  {r.note && <p className="text-sm text-gray-500 mt-0.5">{r.note}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {r.requesterName ?? "匿名"} ・ {new Date(r.createdAt).toLocaleDateString("ja-JP")}
                  </p>
                </div>
                <StatusSelect requestId={r.id} currentStatus={r.status} />
              </div>
              {r.status === "added" && (
                <LinkWork requestId={r.id} linkedTitle={r.linkedTitle} linkedSlug={r.linkedSlug} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
