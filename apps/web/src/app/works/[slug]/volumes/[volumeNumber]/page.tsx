import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { works, episodes, comments } from "@kansou/db";
import { eq, and, isNull, asc } from "drizzle-orm";
import { CommentForm } from "@/app/_components/comment-form";

const BASE_URL = "https://kansou-web-dzqj.vercel.app";

type Params = Promise<{ slug: string; volumeNumber: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, volumeNumber } = await params;
  const [work] = await db.select().from(works).where(eq(works.slug, slug)).limit(1);
  if (!work) return {};
  const title = `${work.title} 第${volumeNumber}巻 感想`;
  const description = `${work.title} 第${volumeNumber}巻の感想・レビュー・考察をみんなで語ろう。ネタバレあり。`;
  const url = `${BASE_URL}/works/${slug}/volumes/${volumeNumber}`;
  return {
    title,
    description,
    openGraph: { type: "article", title, description, url, siteName: "感想ログ", locale: "ja_JP" },
    twitter: { card: "summary", title, description },
    alternates: { canonical: url },
  };
}

export default async function VolumePage({ params }: { params: Params }) {
  const { slug, volumeNumber } = await params;
  const volNum = Number(volumeNumber);
  if (isNaN(volNum) || volNum < 1) notFound();

  const [work] = await db.select().from(works).where(eq(works.slug, slug)).limit(1);
  if (!work) notFound();

  // 巻エントリ（episodeNumber = null）
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

  // この巻に含まれる話リスト
  const chapterList = await db
    .select()
    .from(episodes)
    .where(
      and(
        eq(episodes.workId, work.id),
        eq(episodes.volumeNumber, volNum),
        // episodeNumber が null でないもの = 話エントリ
      )
    )
    .orderBy(asc(episodes.episodeNumber));
  const chapters = chapterList.filter((ep) => ep.episodeNumber !== null);

  const commentList = await db
    .select()
    .from(comments)
    .where(eq(comments.episodeId, volume.id))
    .orderBy(asc(comments.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/works/${slug}`} className="text-sm text-indigo-500 hover:underline">
          ← {work.title}
        </Link>
        <h1 className="text-2xl font-bold mt-2">
          {work.title} 第{volNum}巻 感想
        </h1>
        <p className="text-gray-500 text-sm mt-1">{commentList.length}件のコメント</p>
      </div>

      {chapters.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-2">この巻の収録話</p>
          <div className="flex flex-wrap gap-2">
            {chapters.map((ch) => (
              <Link
                key={ch.id}
                href={`/works/${slug}/episodes/${ch.episodeNumber}`}
                className="text-xs px-2 py-1 bg-white border border-gray-200 rounded hover:border-indigo-300 hover:bg-indigo-50 transition-all"
              >
                {ch.episodeNumber}話{ch.title ? `「${ch.title}」` : ""}
              </Link>
            ))}
          </div>
        </div>
      )}

      <section className="space-y-3">
        {commentList.length === 0 ? (
          <p className="text-center text-gray-400 py-8">まだ感想がありません。最初の一言を投稿しましょう！</p>
        ) : (
          commentList.map((comment) => (
            <div key={comment.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-medium text-gray-600">{comment.authorName}</span>
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString("ja-JP")}
                </span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.body}</p>
            </div>
          ))
        )}
      </section>

      <CommentForm slug={slug} volumeNumber={volNum} />
    </div>
  );
}
