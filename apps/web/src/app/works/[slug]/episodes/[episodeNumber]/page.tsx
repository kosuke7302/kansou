import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { works, episodes, comments } from "@kansou/db";
import { eq, and, asc } from "drizzle-orm";
import { CommentForm } from "@/app/_components/comment-form";

export async function generateMetadata({
  params,
}: PageProps<"/works/[slug]/episodes/[episodeNumber]">): Promise<Metadata> {
  const { slug, episodeNumber } = await params;
  const [work] = await db.select().from(works).where(eq(works.slug, slug)).limit(1);
  if (!work) return {};
  const label = work.type === "movie" ? "本編" : `第${episodeNumber}話`;
  return {
    title: `${work.title} ${label} 感想`,
    description: `${work.title} ${label}の感想・考察スレッド。`,
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

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/works/${slug}`} className="text-sm text-indigo-500 hover:underline">
          ← {work.title}
        </Link>
        <h1 className="text-2xl font-bold mt-2">
          {work.title} {label} 感想
        </h1>
        <p className="text-gray-500 text-sm mt-1">{commentList.length}件のコメント</p>
      </div>

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

      <CommentForm slug={slug} episodeNumber={epNum} />
    </div>
  );
}
