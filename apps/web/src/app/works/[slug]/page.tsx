import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { works, episodes, comments } from "@kansou/db";
import { eq, asc, count, isNull, isNotNull, and } from "drizzle-orm";
import { StreamingBanner } from "@/app/_components/streaming-banner";
import { FavoriteButton } from "@/app/_components/favorite-button";
import { ShareButtons } from "@/app/_components/share-buttons";
import { WorkEpisodeBrowser, type EpisodeRow } from "@/app/_components/work-episode-browser";
import { CommentForm } from "@/app/_components/comment-form";
import { CommentThread } from "@/app/_components/comment-thread";
import { AdSenseAd } from "@/app/_components/adsense";
import { MobileCommentCta } from "@/app/_components/mobile-comment-cta";

export const revalidate = 3600;
export const dynamic = "force-static";

const TYPE_LABELS: Record<string, string> = {
  anime: "アニメ", manga: "漫画", drama: "ドラマ", movie: "映画",
};
const TYPE_STYLES: Record<string, string> = {
  anime: "bg-purple-100 text-purple-700",
  manga: "bg-blue-100 text-blue-700",
  drama: "bg-green-100 text-green-700",
  movie: "bg-orange-100 text-orange-700",
};

const BASE_URL = "https://www.kansou-log.com";

export async function generateMetadata({ params }: PageProps<"/works/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [work] = await db.select().from(works).where(eq(works.slug, slug)).limit(1);
  if (!work) return {};
  const title = `${work.title} 感想・レビュー・評価`;
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

  const isManga = work.type === "manga";
  const isMovie = work.type === "movie";

  const episodeCols = {
    id: episodes.id,
    episodeNumber: episodes.episodeNumber,
    volumeNumber: episodes.volumeNumber,
    title: episodes.title,
    commentCount: count(comments.id),
  };

  const episodesQuery = db
    .select(episodeCols)
    .from(episodes)
    .leftJoin(comments, eq(comments.episodeId, episodes.id))
    .where(and(eq(episodes.workId, work.id), isNotNull(episodes.episodeNumber)))
    .groupBy(episodes.id, episodes.episodeNumber, episodes.volumeNumber, episodes.title)
    .orderBy(asc(episodes.episodeNumber));

  const volumesQuery = isManga
    ? db
        .select(episodeCols)
        .from(episodes)
        .leftJoin(comments, eq(comments.episodeId, episodes.id))
        .where(and(eq(episodes.workId, work.id), isNull(episodes.episodeNumber)))
        .groupBy(episodes.id, episodes.episodeNumber, episodes.volumeNumber, episodes.title)
        .orderBy(asc(episodes.volumeNumber))
    : Promise.resolve([] as EpisodeRow[]);

  const movieEpisodeQuery = isMovie
    ? db
        .select({ id: episodes.id, episodeNumber: episodes.episodeNumber })
        .from(episodes)
        .where(and(eq(episodes.workId, work.id), isNotNull(episodes.episodeNumber)))
        .orderBy(asc(episodes.episodeNumber))
        .limit(1)
    : Promise.resolve([] as { id: number; episodeNumber: number | null }[]);

  const [[{ workCommentCount }], allEpisodes, allVolumes, [movieEpisode]] = await Promise.all([
    db
      .select({ workCommentCount: count(comments.id) })
      .from(comments)
      .where(and(eq(comments.workId, work.id), isNull(comments.episodeId))),
    episodesQuery,
    volumesQuery,
    movieEpisodeQuery,
  ]);

  const movieCommentList = isMovie && movieEpisode
    ? await db
        .select()
        .from(comments)
        .where(eq(comments.episodeId, movieEpisode.id))
        .orderBy(asc(comments.createdAt))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-indigo-500 hover:underline">← 作品一覧</Link>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[work.type]}`}>
            {TYPE_LABELS[work.type]}
          </span>
          <h1 className="text-2xl font-bold">{work.title}</h1>
          <FavoriteButton workId={work.id} slug={slug} />
        </div>
        <div className="mt-2">
          <ShareButtons title={work.title} url={`${BASE_URL}/works/${slug}`} />
        </div>
      </div>

      {/* 作品全体の感想へのリンク */}
      <Link
        href={`/works/${slug}/reviews`}
        className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 hover:bg-amber-100 transition-colors"
      >
        <div>
          <p className="text-sm font-semibold text-amber-800">作品全体の感想・レビュー</p>
          <p className="text-xs text-amber-600 mt-0.5">完読・完走済みの方の感想まとめ（ネタバレ注意）</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {Number(workCommentCount) > 0 && (
            <span className="text-sm font-bold text-amber-700">{workCommentCount}件</span>
          )}
          <span className="text-amber-600 text-lg">→</span>
        </div>
      </Link>

      <StreamingBanner platforms={work.platforms} />

      {isMovie && movieEpisode ? (
        <>
          <MobileCommentCta />
          <section className="space-y-3">
            {movieCommentList.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                このページ、あなたが最初に見つけました。全然コメントがないので助けてください
              </p>
            ) : (
              <CommentThread slug={slug} episodeNumber={movieEpisode.episodeNumber ?? 1} comments={movieCommentList} />
            )}
          </section>

          <CommentForm
            slug={slug}
            episodeNumber={movieEpisode.episodeNumber ?? 1}
            workId={work.id}
            workTitle={work.title}
            episodeId={movieEpisode.id}
          />

          <AdSenseAd slot="" format="auto" />
        </>
      ) : (
        <WorkEpisodeBrowser
          slug={slug}
          isManga={isManga}
          isMovie={isMovie}
          episodeTotal={allEpisodes.length}
          volumeTotal={allVolumes.length}
          episodes={allEpisodes}
          volumes={allVolumes}
        />
      )}
    </div>
  );
}
