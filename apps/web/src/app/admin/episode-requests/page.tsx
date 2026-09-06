import Link from "next/link";
import { db } from "@/lib/db";
import { episodeAddRequests, works, episodes } from "@kansou/db";
import { eq, sql, inArray } from "drizzle-orm";

const FIELD_LABELS: Record<string, string> = { episode: "話", volume: "巻" };

export default async function AdminEpisodeRequestsPage() {
  const grouped = await db
    .select({
      workId: episodeAddRequests.workId,
      field: episodeAddRequests.field,
      requestedNumber: episodeAddRequests.requestedNumber,
      count: sql<number>`count(*)`.mapWith(Number),
      latest: sql<string>`max(${episodeAddRequests.createdAt})`,
      title: works.title,
      slug: works.slug,
    })
    .from(episodeAddRequests)
    .innerJoin(works, eq(works.id, episodeAddRequests.workId))
    .groupBy(episodeAddRequests.workId, episodeAddRequests.field, episodeAddRequests.requestedNumber, works.title, works.slug)
    .orderBy(sql`max(${episodeAddRequests.createdAt}) desc`);

  // 既に追加済み（該当話数/巻がepisodesに存在する）ものは対応済みとして除外する
  const workIds = [...new Set(grouped.map((g) => g.workId))];
  const existingRows = workIds.length
    ? await db
        .select({ workId: episodes.workId, episodeNumber: episodes.episodeNumber, volumeNumber: episodes.volumeNumber })
        .from(episodes)
        .where(inArray(episodes.workId, workIds))
    : [];
  const existingSet = new Set(
    existingRows.map((e) =>
      e.episodeNumber !== null
        ? `${e.workId}:episode:${e.episodeNumber}`
        : `${e.workId}:volume:${e.volumeNumber}`
    )
  );

  const pending = grouped.filter((g) => !existingSet.has(`${g.workId}:${g.field}:${g.requestedNumber}`));
  const fulfilledCount = grouped.length - pending.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">追加話のリクエスト</h1>
        <p className="text-sm text-gray-500 mt-1">
          未対応 {pending.length}件
          {fulfilledCount > 0 && `（対応済み ${fulfilledCount}件は非表示）`}
        </p>
      </div>

      {pending.length === 0 ? (
        <p className="text-gray-400 text-sm py-12 text-center">未対応のリクエストはありません</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {pending.map((r) => (
            <div key={`${r.workId}-${r.field}-${r.requestedNumber}`} className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">
                  {r.title}{" "}
                  <span className="text-indigo-600">
                    第{r.requestedNumber}{FIELD_LABELS[r.field] ?? r.field}
                  </span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {r.count}件のリクエスト ・ 最新 {new Date(r.latest).toLocaleDateString("ja-JP")}
                </p>
              </div>
              <Link
                href={`/admin/works/${r.workId}`}
                className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 shrink-0"
              >
                作品を編集 →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
