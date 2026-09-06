import Link from "next/link";
import { db } from "@/lib/db";
import { analyticsCache, works } from "@kansou/db";
import { eq, or, ilike } from "drizzle-orm";
import type { NetflixTop10Japan, NetflixTop10Row } from "@/lib/netflix-top10";

export const dynamic = "force-dynamic";

async function findPossibleMatch(title: string) {
  // Netflixのタイトルは英語表記のことが多く完全一致は望みにくいので、
  // 部分一致でのゆるいヒントとして提示するだけに留める（自動リンクはしない）
  const rows = await db
    .select({ slug: works.slug, title: works.title })
    .from(works)
    .where(or(ilike(works.title, `%${title}%`), ilike(works.keywords, `%${title}%`)))
    .limit(1);
  return rows[0] ?? null;
}

function Table({ label, rows }: { label: string; rows: NetflixTop10Row[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <h2 className="text-sm font-semibold px-4 py-2.5 bg-gray-50 border-b border-gray-200">{label}</h2>
      <div className="divide-y divide-gray-100">
        {rows.map((r) => (
          <div key={r.rank} className="px-4 py-2.5 flex items-center gap-3">
            <span className="text-sm font-bold text-gray-400 w-6 text-right shrink-0">{r.rank}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{r.title}</p>
              {r.seasonTitle && <p className="text-xs text-gray-400 truncate">{r.seasonTitle}</p>}
            </div>
            <span className="text-xs text-gray-400 shrink-0">累計{r.weeksInTop10}週</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function AdminPopularityPage() {
  const [row] = await db
    .select({ value: analyticsCache.value, updatedAt: analyticsCache.updatedAt })
    .from(analyticsCache)
    .where(eq(analyticsCache.key, "netflix_top10_jp"));

  const data = row?.value as NetflixTop10Japan | undefined;

  // 既にDBに似たタイトルがありそうなものだけ軽く拾っておく(参考情報)
  const allTitles = data ? [...data.tv, ...data.films] : [];
  const matchEntries = await Promise.all(
    allTitles.map(async (r) => [r.title, await findPossibleMatch(r.title)] as const)
  );
  const matchByTitle = new Map(matchEntries);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">配信サービスの人気作品</h1>
        <p className="text-sm text-gray-500 mt-1">
          Netflix公式Top10（日本）を毎日自動取得。次に仕込む作品のリサーチ用です。
        </p>
        {row && (
          <p className="text-xs text-gray-400 mt-1">
            対象週: {data?.weekOf} ・ 最終取得: {new Date(row.updatedAt).toLocaleString("ja-JP")}
          </p>
        )}
      </div>

      {!data ? (
        <p className="text-gray-400 text-sm py-12 text-center">
          データがまだありません。/api/cron/sync-analytics が一度実行されると表示されます。
        </p>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <Table label="TVシリーズ・アニメ TOP10" rows={data.tv} />
            <Table label="映画 TOP10" rows={data.films} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-1.5">
            <h2 className="text-sm font-semibold mb-2">サイト内の既存作品との照合（参考）</h2>
            {allTitles
              .filter((r) => matchByTitle.get(r.title))
              .map((r) => {
                const match = matchByTitle.get(r.title)!;
                return (
                  <p key={r.title} className="text-xs text-gray-500">
                    「{r.title}」→ 「{match.title}」と一致しそう{" "}
                    <Link href={`/works/${match.slug}`} className="text-indigo-500 hover:underline">
                      確認する →
                    </Link>
                  </p>
                );
              })}
            {allTitles.every((r) => !matchByTitle.get(r.title)) && (
              <p className="text-xs text-gray-400">一致しそうな既存作品はありませんでした（英語タイトルのため精度は低めです）</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
