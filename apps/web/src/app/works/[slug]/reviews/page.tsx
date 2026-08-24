import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { works, comments } from "@kansou/db";
import { eq, asc, and, isNull } from "drizzle-orm";
import { WorkCommentForm } from "@/app/_components/work-comment-form";
import { LikeButton } from "@/app/_components/like-button";

const BASE_URL = "https://www.kansou-log.com";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const [work] = await db.select().from(works).where(eq(works.slug, slug)).limit(1);
  if (!work) return {};
  const title = `${work.title} 作品全体の感想・レビュー`;
  const description = `${work.title}を読了・視聴済みの方による総合感想・レビューまとめ。ネタバレあり。`;
  const url = `${BASE_URL}/works/${slug}/reviews`;
  return {
    title,
    description,
    openGraph: { type: "article", title, description, url, siteName: "感想ログ", locale: "ja_JP" },
    twitter: { card: "summary", title, description },
    alternates: { canonical: url },
  };
}

export default async function WorkReviewsPage({ params }: { params: Params }) {
  const { slug } = await params;

  const [work] = await db.select().from(works).where(eq(works.slug, slug)).limit(1);
  if (!work) notFound();

  const commentList = await db
    .select()
    .from(comments)
    .where(and(eq(comments.workId, work.id), isNull(comments.episodeId)))
    .orderBy(asc(comments.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/works/${slug}`} className="text-sm text-indigo-500 hover:underline">
          ← {work.title}
        </Link>
        <h1 className="text-2xl font-bold mt-2">{work.title} 全体感想・レビュー</h1>
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
          ネタバレ注意 — 作品を最後まで読んだ・観た方の感想ページです
        </p>
        <p className="text-gray-500 text-sm mt-2">{commentList.length}件の感想</p>
      </div>

      <section className="space-y-3">
        {commentList.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            まだ全体感想がありません。読了・完走済みの方はぜひ投稿を！
          </p>
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

      <WorkCommentForm slug={slug} />
    </div>
  );
}
