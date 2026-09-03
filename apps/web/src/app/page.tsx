import Link from "next/link";
import { db } from "@/lib/db";
import { works, comments, episodes, analyticsCache } from "@kansou/db";
import { eq, count, gte, desc, isNull, isNotNull, and } from "drizzle-orm";
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
  const topPages = ((topPagesRow?.value as { pages?: TopPageEntry[] } | undefined)?.pages ?? []).slice(0, 3);

  return { monthlyPageViews, topPages };
}

type RecentComment = {
  id: number;
  body: string;
  authorName: string;
  createdAt: Date;
  href: string;
  label: string;
};

async function getRecentComments(limit = 6): Promise<RecentComment[]> {
  const [episodeComments, workComments] = await Promise.all([
    db
      .select({
        id: comments.id,
        body: comments.body,
        authorName: comments.authorName,
        createdAt: comments.createdAt,
        slug: works.slug,
        workTitle: works.title,
        episodeNumber: episodes.episodeNumber,
        volumeNumber: episodes.volumeNumber,
      })
      .from(comments)
      .innerJoin(episodes, eq(episodes.id, comments.episodeId))
      .innerJoin(works, eq(works.id, episodes.workId))
      .where(isNotNull(comments.episodeId))
      .orderBy(desc(comments.createdAt))
      .limit(limit),
    db
      .select({
        id: comments.id,
        body: comments.body,
        authorName: comments.authorName,
        createdAt: comments.createdAt,
        slug: works.slug,
        workTitle: works.title,
      })
      .from(comments)
      .innerJoin(works, eq(works.id, comments.workId))
      .where(and(isNull(comments.episodeId), isNotNull(comments.workId)))
      .orderBy(desc(comments.createdAt))
      .limit(limit),
  ]);

  return [
    ...episodeComments.map((c) => ({
      id: c.id,
      body: c.body,
      authorName: c.authorName,
      createdAt: c.createdAt,
      href: c.volumeNumber != null ? `/works/${c.slug}/volumes/${c.volumeNumber}` : `/works/${c.slug}/episodes/${c.episodeNumber}`,
      label: c.volumeNumber != null ? `${c.workTitle} 第${c.volumeNumber}巻` : `${c.workTitle} 第${c.episodeNumber}話`,
    })),
    ...workComments.map((c) => ({
      id: c.id,
      body: c.body,
      authorName: c.authorName,
      createdAt: c.createdAt,
      href: `/works/${c.slug}/reviews`,
      label: `${c.workTitle} 作品全体`,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

export default async function HomePage() {
  const [allWorks, requestOriginWorks, analyticsStats, recentComments] = await Promise.all([
    getWorks(),
    getRequestOriginWorks(),
    getAnalyticsStats(),
    getRecentComments(),
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
          <h2 className="text-base font-semibold mb-3">📈 直近7日間のアクセスTOP3</h2>
          <div className="grid gap-2">
            {analyticsStats.topPages.map((p, i) => (
              <Link
                key={p.path}
                href={p.path}
                className="flex items-center gap-3 min-w-0 bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <span className="w-6 text-center text-sm font-bold shrink-0 text-indigo-500">
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

      {recentComments.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-3">💬 最近の感想</h2>
          <div className="grid gap-2">
            {recentComments.map((c) => (
              <Link
                key={c.id}
                href={c.href}
                className="block min-w-0 bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <p className="text-xs text-indigo-500 truncate">{c.label}</p>
                <p className="text-sm text-gray-700 line-clamp-2 mt-0.5">{c.body}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {c.authorName} ・ {new Date(c.createdAt).toLocaleDateString("ja-JP")}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <WorksFilter works={allWorks} requestOriginWorks={requestOriginWorks} />
    </div>
  );
}
