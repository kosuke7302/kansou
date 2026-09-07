import { db } from "@/lib/db";
import { comments, favorites, episodeRatings, workRequests, contactMessages } from "@kansou/db";
import { sql, avg, count } from "drizzle-orm";

export const dynamic = "force-dynamic";

const REQUEST_STATUS_LABELS: Record<string, string> = {
  pending: "未対応", in_progress: "対応中", added: "追加済み", rejected: "却下",
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default async function AdminStatsPage() {
  const [
    [{ commentTotal }],
    [{ favoriteTotal }],
    [{ favoriteUsers }],
    [{ ratingTotal, ratingAvg }],
    requestRows,
    [{ contactTotal }],
    activeUserRows,
  ] = await Promise.all([
    db.select({ commentTotal: count() }).from(comments),
    db.select({ favoriteTotal: count() }).from(favorites),
    db.select({ favoriteUsers: sql<number>`count(distinct ${favorites.userId})` }).from(favorites),
    db.select({ ratingTotal: count(), ratingAvg: avg(episodeRatings.rating) }).from(episodeRatings),
    db.select({ status: workRequests.status, total: count() }).from(workRequests).groupBy(workRequests.status),
    db.select({ contactTotal: count() }).from(contactMessages),
    db.execute(sql`
      SELECT count(DISTINCT uid) AS cnt FROM (
        SELECT user_id AS uid FROM favorites
        UNION
        SELECT user_id AS uid FROM comments WHERE user_id IS NOT NULL
        UNION
        SELECT user_id AS uid FROM episode_ratings
      ) t
    `),
  ]);

  const activeUserCount = Number((activeUserRows.rows[0] as { cnt: string }).cnt);
  const requestTotal = requestRows.reduce((sum, r) => sum + Number(r.total), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">利用状況</h1>
        <p className="text-sm text-gray-500 mt-1">ユーザーのアクション実績の集計です</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="コメント" value={Number(commentTotal)} />
        <StatCard
          label="お気に入り"
          value={Number(favoriteTotal)}
          sub={`${Number(favoriteUsers)}ユーザー`}
        />
        <StatCard
          label="評価（星）"
          value={Number(ratingTotal)}
          sub={ratingTotal > 0 ? `平均 ${Number(ratingAvg).toFixed(1)}` : undefined}
        />
        <StatCard label="作品リクエスト" value={requestTotal} />
        <StatCard label="お問い合わせ" value={Number(contactTotal)} />
        <StatCard
          label="行動したユニークユーザー数"
          value={activeUserCount}
          sub="お気に入り・コメント・評価のいずれか"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 max-w-md">
        <h2 className="text-sm font-semibold mb-3">作品リクエストの状況</h2>
        {requestTotal === 0 ? (
          <p className="text-sm text-gray-400">まだリクエストはありません</p>
        ) : (
          <div className="space-y-1.5">
            {requestRows.map((r) => (
              <div key={r.status} className="flex items-center justify-between text-sm">
                <span>{REQUEST_STATUS_LABELS[r.status] ?? r.status}</span>
                <span className="font-medium">{Number(r.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
