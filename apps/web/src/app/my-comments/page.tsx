import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { comments, episodes, works } from "@kansou/db";
import { eq, and, isNull, isNotNull, desc } from "drizzle-orm";
import { LoginPrompt } from "@/app/_components/login-prompt";

export const metadata: Metadata = {
  title: "マイコメント",
  robots: { index: false },
};

export default async function MyCommentsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <LoginPrompt message="自分のコメント一覧を見るにはログインが必要です" />;
  }

  const [episodeComments, workComments] = await Promise.all([
    db
      .select({
        id: comments.id,
        body: comments.body,
        createdAt: comments.createdAt,
        slug: works.slug,
        workTitle: works.title,
        episodeNumber: episodes.episodeNumber,
        volumeNumber: episodes.volumeNumber,
      })
      .from(comments)
      .innerJoin(episodes, eq(episodes.id, comments.episodeId))
      .innerJoin(works, eq(works.id, episodes.workId))
      .where(and(eq(comments.userId, userId), isNotNull(comments.episodeId))),
    db
      .select({
        id: comments.id,
        body: comments.body,
        createdAt: comments.createdAt,
        slug: works.slug,
        workTitle: works.title,
      })
      .from(comments)
      .innerJoin(works, eq(works.id, comments.workId))
      .where(and(eq(comments.userId, userId), isNull(comments.episodeId))),
  ]);

  type Row = {
    id: number;
    body: string;
    createdAt: Date;
    href: string;
    label: string;
  };

  const rows: Row[] = [
    ...episodeComments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt,
      href:
        c.volumeNumber != null
          ? `/works/${c.slug}/volumes/${c.volumeNumber}`
          : `/works/${c.slug}/episodes/${c.episodeNumber}`,
      label:
        c.volumeNumber != null
          ? `${c.workTitle} 第${c.volumeNumber}巻`
          : `${c.workTitle} 第${c.episodeNumber}話`,
    })),
    ...workComments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt,
      href: `/works/${c.slug}/reviews`,
      label: `${c.workTitle} 作品全体`,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">マイコメント</h1>
      {rows.length === 0 ? (
        <p className="text-gray-400 text-sm py-12 text-center">
          まだコメントを投稿していません
        </p>
      ) : (
        <div className="grid gap-2">
          {rows.map((row) => (
            <Link
              key={row.id}
              href={row.href}
              className="block bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <p className="text-xs text-indigo-500 font-medium mb-1">{row.label}</p>
              <p className="text-sm text-gray-700 line-clamp-2">{row.body}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
