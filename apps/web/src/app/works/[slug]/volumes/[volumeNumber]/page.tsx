import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { works, episodes, comments, episodeRatings } from "@kansou/db";
import { eq, and, isNull, asc, avg, count } from "drizzle-orm";

import { CommentForm } from "@/app/_components/comment-form";
import { AdSenseAd } from "@/app/_components/adsense";
import { ShareButtons } from "@/app/_components/share-buttons";
import { CommentThread } from "@/app/_components/comment-thread";
import { EpisodeRating } from "@/app/_components/episode-rating";
import { EpisodeNav } from "@/app/_components/episode-nav";
import { MobileCommentCta } from "@/app/_components/mobile-comment-cta";

const BASE_URL = "https://www.kansou-log.com";

export const revalidate = 3600;
export const dynamic = "force-static";

type Params = Promise<{ slug: string; volumeNumber: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, volumeNumber } = await params;
  const [work] = await db.select().from(works).where(eq(works.slug, slug)).limit(1);
  if (!work) return {};
  const title = `${work.title} 第${volumeNumber}巻 感想・レビュー`;
  const description = `${work.title} 第${volumeNumber}巻の感想・レビュー・考察をみんなで語ろう。ネタバレあり。`;
  const url = `${BASE_URL}/works/${slug}/volumes/${volumeNumber}`;
  return {
    title,
    description,
    openGraph: { type: "article", title, description, url, siteName: "感想ログ", locale: "ja_JP" },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: url },
  };
}

export default async function VolumePage({ params }: { params: Params }) {
  const { slug, volumeNumber } = await params;
  const volNum = Number(volumeNumber);
  if (isNaN(volNum) || volNum < 1) notFound();

  const [work] = await db.select().from(works).where(eq(works.slug, slug)).limit(1);
  if (!work) notFound();

  const [volume] = await db
    .select()
    .from(episodes)
    .where(
      and(
        eq(episodes.workId, work.id),
        eq(episodes.volumeNumber, volNum),
        isNull(episodes.episodeNumber)
      )
    )
    .limit(1);
  if (!volume) notFound();

  const commentList = await db
    .select()
    .from(comments)
    .where(eq(comments.episodeId, volume.id))
    .orderBy(asc(comments.createdAt));

  const [{ averageRating, ratingCount }] = await db
    .select({ averageRating: avg(episodeRatings.rating), ratingCount: count(episodeRatings.id) })
    .from(episodeRatings)
    .where(eq(episodeRatings.episodeId, volume.id));

  const [prevVolume] = await db
    .select({ volumeNumber: episodes.volumeNumber })
    .from(episodes)
    .where(
      and(eq(episodes.workId, work.id), eq(episodes.volumeNumber, volNum - 1), isNull(episodes.episodeNumber))
    )
    .limit(1);
  const [nextVolume] = await db
    .select({ volumeNumber: episodes.volumeNumber })
    .from(episodes)
    .where(
      and(eq(episodes.workId, work.id), eq(episodes.volumeNumber, volNum + 1), isNull(episodes.episodeNumber))
    )
    .limit(1);

  const shareTitle = `${work.title} 第${volNum}巻 感想`;
  const pageUrl = `${BASE_URL}/works/${slug}/volumes/${volNum}`;

  const datePublished = commentList.length > 0
    ? new Date(commentList[0].createdAt).toISOString()
    : "2024-10-01T00:00:00+09:00";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    "headline": shareTitle,
    "url": pageUrl,
    "inLanguage": "ja",
    "author": {
      "@type": "Organization",
      "name": "感想ログ",
      "url": BASE_URL,
    },
    "datePublished": datePublished,
    "text": `${work.title} 第${volNum}巻の感想・レビュー・考察スレッドです。ネタバレを含む場合があります。`,
    "about": {
      "@type": "CreativeWork",
      "name": work.title,
    },
    "commentCount": commentList.length,
    ...(commentList.length > 0 && {
      "comment": commentList.map((c) => ({
        "@type": "Comment",
        "author": { "@type": "Person", "name": c.authorName ?? "名無し" },
        "datePublished": new Date(c.createdAt).toISOString(),
        "text": c.body,
        ...(c.imageUrl && { "image": c.imageUrl }),
      })),
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-6 pb-20 sm:pb-0">
      <MobileCommentCta />
      <div>
        <Link href={`/works/${slug}`} className="text-sm text-indigo-500 hover:underline">
          ← {work.title}
        </Link>
        <h1 className="text-2xl font-bold mt-2">
          {work.title} 第{volNum}巻 感想
        </h1>
        <div className="flex items-center justify-between mt-2">
          <p className="text-gray-500 text-sm">{commentList.length}件のコメント</p>
          <ShareButtons title={shareTitle} url={pageUrl} />
        </div>
      </div>

      <EpisodeNav
        slug={slug}
        workId={work.id}
        field="volume"
        currentNumber={volNum}
        prevNumber={prevVolume?.volumeNumber ?? null}
        nextExists={!!nextVolume}
      />

      <section className="space-y-3">
        {commentList.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            このページ、あなたが最初に見つけました。全然コメントがないので助けてください
          </p>
        ) : (
          <CommentThread slug={slug} volumeNumber={volNum} comments={commentList} />
        )}
      </section>

      <CommentForm
        slug={slug}
        volumeNumber={volNum}
        workId={work.id}
        workTitle={work.title}
        episodeId={volume.id}
      />

      <AdSenseAd slot="" format="auto" />

      <EpisodeRating
        episodeId={volume.id}
        averageRating={Number(averageRating) || 0}
        ratingCount={Number(ratingCount)}
      />
      <EpisodeNav
        slug={slug}
        workId={work.id}
        field="volume"
        currentNumber={volNum}
        prevNumber={prevVolume?.volumeNumber ?? null}
        nextExists={!!nextVolume}
      />
    </div>
    </>
  );
}
