import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { works, threads, comments } from "@kansou/db";
import { eq, desc, count } from "drizzle-orm";
import { isThreadPilot } from "@/lib/thread-pilot";
import { ThreadSection } from "@/app/_components/thread-section";

export const revalidate = 60;
export const dynamic = "force-static";

const BASE_URL = "https://www.kansou-log.com";

type Params = Promise<{ slug: string }>;

async function loadThreads(slug: string) {
  if (!isThreadPilot(slug)) return null;
  const [work] = await db.select({ id: works.id, title: works.title }).from(works).where(eq(works.slug, slug)).limit(1);
  if (!work) return null;

  const rows = await db
    .select({
      id: threads.id,
      title: threads.title,
      authorName: threads.authorName,
      createdAt: threads.createdAt,
      commentCount: count(comments.id),
    })
    .from(threads)
    .leftJoin(comments, eq(comments.threadId, threads.id))
    .where(eq(threads.workId, work.id))
    .groupBy(threads.id, threads.title, threads.authorName, threads.createdAt)
    .orderBy(desc(threads.createdAt));

  return { work, threads: rows.map((r) => ({ ...r, commentCount: Number(r.commentCount) })) };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadThreads(slug);
  if (!data) return {};
  const title = `${data.work.title} スレッド一覧 | 感想ログ`;
  const description = `${data.work.title}のスレッド一覧。考察や予想をみんなで語れます。ネタバレあり。`;
  const url = `${BASE_URL}/works/${slug}/threads`;
  return {
    title,
    description,
    openGraph: { type: "website", title, description, url, siteName: "感想ログ", locale: "ja_JP" },
    alternates: { canonical: url },
  };
}

export default async function ThreadListPage({ params }: { params: Params }) {
  const { slug } = await params;
  const data = await loadThreads(slug);
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/works/${slug}`} className="text-sm text-accent-500 hover:underline">
          ← {data.work.title}
        </Link>
        <h1 className="font-head text-2xl font-bold mt-2">{data.work.title} のスレッド</h1>
      </div>
      <ThreadSection slug={slug} threads={data.threads} />
    </div>
  );
}
