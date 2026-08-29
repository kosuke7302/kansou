import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { works, episodes, comments, episodeReactions, episodeRatings } from "@kansou/db";
import { eq, and, asc, avg, count } from "drizzle-orm";
import { CommentForm } from "@/app/_components/comment-form";
import { AdSenseAd } from "@/app/_components/adsense";
import { ShareButtons } from "@/app/_components/share-buttons";
import { CommentThread } from "@/app/_components/comment-thread";
import { EpisodeReactions } from "@/app/_components/episode-reactions";
import { EpisodeRating } from "@/app/_components/episode-rating";
import { REACTION_TYPES, type ReactionType } from "@/lib/reaction-types";

const BASE_URL = "https://www.kansou-log.com";

export const revalidate = 60;
export const dynamic = "force-static";

const TYPE_LABELS: Record<string, string> = {
  anime: "アニメ", manga: "漫画", drama: "ドラマ", movie: "映画",
};

export async function generateMetadata({
  params,
}: PageProps<"/works/[slug]/episodes/[episodeNumber]">): Promise<Metadata> {
  const { slug, episodeNumber } = await params;
  const [work] = await db.select().from(works).where(eq(works.slug, slug)).limit(1);
  if (!work) return {};
  const label = work.type === "movie" ? "本編" : `第${episodeNumber}話`;
  const title = `${work.title} ${label} 感想`;
  const description = `${work.title} ${label}の感想・レビュー・考察をみんなで語ろう。ネタバレあり。`;
  const url = `${BASE_URL}/works/${slug}/episodes/${episodeNumber}`;

  return {
    title,
    description,
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: "感想ログ",
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function EpisodePage({
  params,
}: PageProps<"/works/[slug]/episodes/[episodeNumber]">) {
  const { slug, episodeNumber } = await params;
  const epNum = Number(episodeNumber);
  if (isNaN(epNum) || epNum < 1) notFound();

  const [work] = await db.select().from(works).where(eq(works.slug, slug)).limit(1);
  if (!work) notFound();

  const [episode] = await db
    .select()
    .from(episodes)
    .where(and(eq(episodes.workId, work.id), eq(episodes.episodeNumber, epNum)))
    .limit(1);
  if (!episode) notFound();

  const commentList = await db
    .select()
    .from(comments)
    .where(eq(comments.episodeId, episode.id))
    .orderBy(asc(comments.createdAt));

  const reactionRows = await db
    .select({ type: episodeReactions.type, count: episodeReactions.count })
    .from(episodeReactions)
    .where(eq(episodeReactions.episodeId, episode.id));
  const reactionCounts = Object.fromEntries(
    REACTION_TYPES.map((t) => [t, reactionRows.find((r) => r.type === t)?.count ?? 0])
  ) as Record<ReactionType, number>;

  const [{ averageRating, ratingCount }] = await db
    .select({ averageRating: avg(episodeRatings.rating), ratingCount: count(episodeRatings.id) })
    .from(episodeRatings)
    .where(eq(episodeRatings.episodeId, episode.id));

  const label = work.type === "movie" ? "本編" : `第${epNum}話`;
  const pageUrl = `${BASE_URL}/works/${slug}/episodes/${epNum}`;
  const shareTitle = `${work.title} ${label} 感想`;

  const datePublished = commentList.length > 0
    ? new Date(commentList[0].createdAt).toISOString()
    : "2024-10-01T00:00:00+09:00";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    "headline": `${work.title} ${label} 感想・考察`,
    "url": pageUrl,
    "inLanguage": "ja",
    "author": {
      "@type": "Organization",
      "name": "感想ログ",
      "url": BASE_URL,
    },
    "datePublished": datePublished,
    "text": `${work.title} ${label}の感想・レビュー・考察スレッドです。ネタバレを含む場合があります。`,
    "about": {
      "@type": "CreativeWork",
      "name": work.title,
      "genre": TYPE_LABELS[work.type],
    },
    "commentCount": commentList.length,
    ...(commentList.length > 0 && {
      "comment": commentList.map((c) => ({
        "@type": "Comment",
        "author": { "@type": "Person", "name": c.authorName ?? "名無し" },
        "datePublished": new Date(c.createdAt).toISOString(),
        "text": c.body,
      })),
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-6">
        <div>
          <Link href={`/works/${slug}`} className="text-sm text-indigo-500 hover:underline">
            ← {work.title}
          </Link>
          <h1 className="text-2xl font-bold mt-2">
            {work.title} {label} 感想
          </h1>
          {episode.title && (
            <p className="text-gray-600 text-sm mt-0.5">「{episode.title}」</p>
          )}
          <div className="flex items-center justify-between mt-2">
            <p className="text-gray-500 text-sm">{commentList.length}件のコメント</p>
            <ShareButtons title={shareTitle} url={pageUrl} />
          </div>
        </div>

        {work.type !== "movie" && (
          <>
            <EpisodeRating
              episodeId={episode.id}
              averageRating={Number(averageRating) || 0}
              ratingCount={Number(ratingCount)}
            />
            <EpisodeReactions
              episodeId={episode.id}
              episodeLabel={label}
              initialCounts={reactionCounts}
            />
          </>
        )}

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">みんなの感想</h2>
          {commentList.length === 0 ? (
            <p className="text-center text-gray-400 py-8">まだ感想がありません。最初の一言を投稿しましょう！</p>
          ) : (
            <CommentThread slug={slug} episodeNumber={epNum} comments={commentList} />
          )}
        </section>

        <AdSenseAd slot="" format="auto" />

        <CommentForm slug={slug} episodeNumber={epNum} />
      </div>
    </>
  );
}
