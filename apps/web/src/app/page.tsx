import { db } from "@/lib/db";
import { works, comments, episodes } from "@kansou/db";
import { eq, count } from "drizzle-orm";
import { WorksFilter, type Work } from "./_components/works-filter";

async function getWorks(): Promise<Work[]> {
  // 作品ごとの話数数
  const worksWithEpisodes = await db
    .select({
      id: works.id,
      slug: works.slug,
      title: works.title,
      type: works.type,
      episodeCount: count(episodes.id),
    })
    .from(works)
    .leftJoin(episodes, eq(episodes.workId, works.id))
    .groupBy(works.id, works.slug, works.title, works.type);

  // 作品ごとのコメント数（episodes 経由で集計）
  const commentCountRows = await db
    .select({
      workId: episodes.workId,
      commentCount: count(comments.id),
    })
    .from(comments)
    .innerJoin(episodes, eq(comments.episodeId, episodes.id))
    .groupBy(episodes.workId);

  const commentMap = new Map(
    commentCountRows.map((r) => [r.workId, Number(r.commentCount)])
  );

  return worksWithEpisodes.map((w) => ({
    slug: w.slug,
    title: w.title,
    type: w.type,
    episodeCount: Number(w.episodeCount),
    commentCount: commentMap.get(w.id) ?? 0,
  }));
}

export default async function HomePage() {
  const allWorks = await getWorks();

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold mb-1">感想ログ</h1>
        <p className="text-gray-500 text-sm">
          アニメ・漫画・ドラマ・映画の話数ごとに感想を投稿・閲覧できるサイト
        </p>
      </section>

      <WorksFilter works={allWorks} />
    </div>
  );
}
