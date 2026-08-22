import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { works, episodes, comments } from "@kansou/db";
import { eq, asc, count } from "drizzle-orm";

const TYPE_LABELS: Record<string, string> = {
  anime: "アニメ", manga: "漫画", drama: "ドラマ", movie: "映画",
};
const TYPE_STYLES: Record<string, string> = {
  anime: "bg-purple-100 text-purple-700",
  manga: "bg-blue-100 text-blue-700",
  drama: "bg-green-100 text-green-700",
  movie: "bg-orange-100 text-orange-700",
};

const BASE_URL = "https://kansou-web-dzqj.vercel.app";

export async function generateMetadata({ params }: PageProps<"/works/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [work] = await db.select().from(works).where(eq(works.slug, slug)).limit(1);
  if (!work) return {};
  const title = `${work.title} 感想`;
  const description = `${work.title}の話数ごとの感想・レビュー・考察まとめ。ネタバレあり。`;
  const url = `${BASE_URL}/works/${slug}`;
  return {
    title,
    description,
    openGraph: { type: "article", title, description, url, siteName: "感想ログ", locale: "ja_JP" },
    twitter: { card: "summary", title, description },
    alternates: { canonical: url },
  };
}

export default async function WorkPage({ params }: PageProps<"/works/[slug]">) {
  const { slug } = await params;

  const [work] = await db.select().from(works).where(eq(works.slug, slug)).limit(1);
  if (!work) notFound();

  // エピソードとコメント数を一括取得
  const epsWithCounts = await db
    .select({
      id: episodes.id,
      episodeNumber: episodes.episodeNumber,
      volumeNumber: episodes.volumeNumber,
      title: episodes.title,
      commentCount: count(comments.id),
    })
    .from(episodes)
    .leftJoin(comments, eq(comments.episodeId, episodes.id))
    .where(eq(episodes.workId, work.id))
    .groupBy(episodes.id, episodes.episodeNumber, episodes.volumeNumber, episodes.title)
    .orderBy(asc(episodes.volumeNumber), asc(episodes.episodeNumber));

  const isManga = work.type === "manga";
  const isMovie = work.type === "movie";

  const volumes = epsWithCounts.filter((ep) => ep.episodeNumber === null);
  const episodeList = epsWithCounts.filter((ep) => ep.episodeNumber !== null);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-indigo-500 hover:underline">← 作品一覧</Link>
        <div className="flex items-center gap-3 mt-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[work.type]}`}>
            {TYPE_LABELS[work.type]}
          </span>
          <h1 className="text-2xl font-bold">{work.title}</h1>
        </div>
        {work.description && (
          <p className="text-gray-500 text-sm mt-1">{work.description}</p>
        )}
      </div>

      {isManga ? (
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-3">巻一覧</h2>
            {volumes.length === 0 ? (
              <p className="text-gray-400 text-sm">データがありません</p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {volumes.map((vol) => (
                  <Link
                    key={vol.id}
                    href={`/works/${slug}/volumes/${vol.volumeNumber}`}
                    className="relative flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg py-2 text-sm hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                  >
                    <span>第{vol.volumeNumber}巻</span>
                    {Number(vol.commentCount) > 0 && (
                      <span className="text-xs text-indigo-500 font-medium">💬{vol.commentCount}</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">話一覧</h2>
            {episodeList.length === 0 ? (
              <p className="text-gray-400 text-sm">データがありません</p>
            ) : (
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                {episodeList.map((ep) => (
                  <Link
                    key={ep.id}
                    href={`/works/${slug}/episodes/${ep.episodeNumber}`}
                    title={ep.title ?? undefined}
                    className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg py-2 text-xs hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                  >
                    <span>{ep.episodeNumber}話</span>
                    {Number(ep.commentCount) > 0 && (
                      <span className="text-indigo-500 font-medium">💬{ep.commentCount}</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <section>
          <h2 className="text-lg font-semibold mb-3">
            {isMovie ? "作品" : "話数一覧"}
          </h2>
          {episodeList.length === 0 ? (
            <p className="text-gray-400 text-sm">データがありません</p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {episodeList.map((ep) => (
                <Link
                  key={ep.id}
                  href={`/works/${slug}/episodes/${ep.episodeNumber}`}
                  title={ep.title ?? undefined}
                  className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg py-2 text-sm hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                >
                  <span>{isMovie ? "本編" : `第${ep.episodeNumber}話`}</span>
                  {Number(ep.commentCount) > 0 && (
                    <span className="text-xs text-indigo-500 font-medium">💬{ep.commentCount}</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
