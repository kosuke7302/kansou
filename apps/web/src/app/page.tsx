import Link from "next/link";
import { db } from "@/lib/db";
import { works, comments, episodes, analyticsCache } from "@kansou/db";
import { eq, count, gte, desc } from "drizzle-orm";
import { WorksFilter, type Work } from "./_components/works-filter";

export const revalidate = 60;

async function getWorks(): Promise<Work[]> {
  const worksWithEpisodes = await db
    .select({
      id: works.id,
      slug: works.slug,
      title: works.title,
      type: works.type,
      platforms: works.platforms,
      episodeCount: count(episodes.id),
    })
    .from(works)
    .leftJoin(episodes, eq(episodes.workId, works.id))
    .groupBy(works.id, works.slug, works.title, works.type, works.platforms);

  // 総コメント数
  const commentCountRows = await db
    .select({
      workId: episodes.workId,
      commentCount: count(comments.id),
    })
    .from(comments)
    .innerJoin(episodes, eq(comments.episodeId, episodes.id))
    .groupBy(episodes.workId);

  // 直近7日間のコメント数（トレンド用）
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentCommentRows = await db
    .select({
      workId: episodes.workId,
      recentCount: count(comments.id),
    })
    .from(comments)
    .innerJoin(episodes, eq(comments.episodeId, episodes.id))
    .where(gte(comments.createdAt, since))
    .groupBy(episodes.workId);

  const commentMap = new Map(commentCountRows.map((r) => [r.workId, Number(r.commentCount)]));
  const recentMap = new Map(recentCommentRows.map((r) => [r.workId, Number(r.recentCount)]));

  return worksWithEpisodes.map((w) => ({
    slug: w.slug,
    title: w.title,
    type: w.type,
    platforms: (w.platforms as import("./_components/works-filter").Platform[] | null) ?? null,
    episodeCount: Number(w.episodeCount),
    commentCount: commentMap.get(w.id) ?? 0,
    recentCommentCount: recentMap.get(w.id) ?? 0,
  }));
}

async function getRequestOriginWorks() {
  const rows = await db
    .select({ id: works.id, slug: works.slug, title: works.title, type: works.type })
    .from(works)
    .where(eq(works.fromRequest, true))
    .orderBy(desc(works.createdAt))
    .limit(10);
  return rows;
}

type TopPageEntry = {
  path: string;
  title: string;
  label: string | null;
  pageViews: number;
  activeUsers: number;
};

async function getAnalyticsStats() {
  const rows = await db
    .select({ key: analyticsCache.key, value: analyticsCache.value })
    .from(analyticsCache)
    .where(eq(analyticsCache.key, "monthly_pageviews"));
  const [topPagesRow] = await db
    .select({ value: analyticsCache.value })
    .from(analyticsCache)
    .where(eq(analyticsCache.key, "top_pages_7d"));

  const monthlyPageViews = (rows[0]?.value as { count?: number } | undefined)?.count ?? null;
  const topPages = ((topPagesRow?.value as { pages?: TopPageEntry[] } | undefined)?.pages ?? []).slice(0, 10);

  return { monthlyPageViews, topPages };
}

export default async function HomePage() {
  const [allWorks, requestOriginWorks, analyticsStats] = await Promise.all([
    getWorks(),
    getRequestOriginWorks(),
    getAnalyticsStats(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">感想ログ</h1>

      {analyticsStats.monthlyPageViews !== null && (
        <p className="text-sm text-gray-500">
          直近30日間のページ閲覧数: <span className="font-semibold text-gray-700">{analyticsStats.monthlyPageViews.toLocaleString()}</span>回
        </p>
      )}

      {analyticsStats.topPages.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-3">📈 直近7日間のアクセスTOP10</h2>
          <div className="grid gap-2">
            {analyticsStats.topPages.map((p, i) => (
              <Link
                key={p.path}
                href={p.path}
                className="flex items-center gap-3 min-w-0 bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <span className={`w-6 text-center text-sm font-bold shrink-0 ${i < 3 ? "text-indigo-500" : "text-gray-400"}`}>
                  {i + 1}
                </span>
                <span className="font-medium truncate min-w-0 flex-1">
                  {p.title}{p.label && ` ${p.label}`}
                </span>
                <span className="shrink-0 text-sm text-gray-400">👁 {p.pageViews.toLocaleString()}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <WorksFilter works={allWorks} requestOriginWorks={requestOriginWorks} />
    </div>
  );
}
