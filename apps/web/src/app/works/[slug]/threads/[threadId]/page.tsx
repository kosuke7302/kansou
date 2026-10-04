import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { works, threads, comments } from "@kansou/db";
import { eq, and, asc } from "drizzle-orm";
import { isThreadPilot } from "@/lib/thread-pilot";
import { ThreadCommentForm } from "@/app/_components/thread-comment-form";

export const revalidate = 60;
export const dynamic = "force-static";

const BASE_URL = "https://www.kansou-log.com";

type Params = Promise<{ slug: string; threadId: string }>;

async function loadThread(slug: string, threadIdRaw: string) {
  const threadId = Number(threadIdRaw);
  if (!Number.isInteger(threadId) || !isThreadPilot(slug)) return null;

  const [row] = await db
    .select({ id: threads.id, title: threads.title, workTitle: works.title })
    .from(threads)
    .innerJoin(works, eq(works.id, threads.workId))
    .where(and(eq(threads.id, threadId), eq(works.slug, slug)))
    .limit(1);
  if (!row) return null;

  const commentList = await db
    .select({
      id: comments.id,
      authorName: comments.authorName,
      body: comments.body,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .where(eq(comments.threadId, threadId))
    .orderBy(asc(comments.createdAt));

  return { ...row, threadId, comments: commentList };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, threadId } = await params;
  const thread = await loadThread(slug, threadId);
  if (!thread) return {};
  const title = `${thread.title} | ${thread.workTitle} 感想・考察スレ`;
  const description = `${thread.workTitle}のスレッド「${thread.title}」。みんなの考察・感想を読めます。ネタバレあり。`;
  const url = `${BASE_URL}/works/${slug}/threads/${thread.threadId}`;
  return {
    title,
    description,
    openGraph: { type: "article", title, description, url, siteName: "感想ログ", locale: "ja_JP" },
    alternates: { canonical: url },
  };
}

export default async function ThreadPage({ params }: { params: Params }) {
  const { slug, threadId } = await params;
  const thread = await loadThread(slug, threadId);
  if (!thread) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/works/${slug}`} className="text-sm text-accent-500 hover:underline">
          ← {thread.workTitle}
        </Link>
        <h1 className="font-head text-2xl font-bold mt-2">{thread.title}</h1>
        <p className="text-sm text-ink-muted mt-1">{thread.comments.length}件の書き込み</p>
      </div>

      <section className="space-y-3">
        {thread.comments.map((c, i) => (
          <div key={c.id} className="bg-white border border-line rounded-card px-4 py-3">
            <div className="flex items-center gap-2 mb-1 text-xs">
              <span className="font-semibold text-ink">
                {i + 1}. {c.authorName}
              </span>
              <span className="text-ink-muted">
                {new Date(c.createdAt).toLocaleString("ja-JP", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{c.body}</p>
          </div>
        ))}
      </section>

      <ThreadCommentForm slug={slug} threadId={thread.threadId} />
    </div>
  );
}
