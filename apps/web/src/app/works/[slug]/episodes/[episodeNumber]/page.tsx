import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { works, episodes, comments } from "@kansou/db";
import { eq, and, asc } from "drizzle-orm";
import { CommentForm } from "@/app/_components/comment-form";
import { AdSenseAd } from "@/app/_components/adsense";
import { ShareButtons } from "@/app/_components/share-buttons";
import { LikeButton } from "@/app/_components/like-button";

const BASE_URL = "https://kansou-log.com";

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

        <section className="space-y-3">
          {commentList.length === 0 ? (
            <p className="text-center text-gray-400 py-8">まだ感想がありません。最初の一言を投稿しましょう！</p>
          ) : (
            commentList.map((comment) => (
              <div key={comment.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600">{comment.authorName}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                  <LikeButton commentId={comment.id} initialCount={comment.likeCount} />
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.body}</p>
              </div>
            ))
          )}
        </section>

        <AdSenseAd slot="" format="auto" />

        <CommentForm slug={slug} episodeNumber={epNum} />
      </div>
    </>
  );
}
