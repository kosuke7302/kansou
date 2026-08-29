import { db } from "@/lib/db";
import { works, comments, episodes } from "@kansou/db";
import { eq, count, gte } from "drizzle-orm";
import { WorksFilter, type Work } from "./_components/works-filter";

export const revalidate = 60;

async function getWorks(): Promise<Work[]> {
  const worksWithEpisodes = await db
    .select({
      id: works.id,
      slug: works.slug,
      title: works.title,
      type: works.type,
      platform: works.platform,
      episodeCount: count(episodes.id),
    })
    .from(works)
    .leftJoin(episodes, eq(episodes.workId, works.id))
    .groupBy(works.id, works.slug, works.title, works.type, works.platform);

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
    platform: (w.platform as import("./_components/works-filter").Platform | null) ?? null,
    episodeCount: Number(w.episodeCount),
    commentCount: commentMap.get(w.id) ?? 0,
    recentCommentCount: recentMap.get(w.id) ?? 0,
  }));
}

export default async function HomePage() {
  const allWorks = await getWorks();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">感想ログ</h1>

      <WorksFilter works={allWorks} />
    </div>
  );
}
