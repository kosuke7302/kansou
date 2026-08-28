import Link from "next/link";
import { db } from "@/lib/db";
import { comments, episodes, works } from "@kansou/db";
import { eq, and, isNull, isNotNull } from "drizzle-orm";
import { DeleteCommentButton } from "./_delete-comment-button";

const PAGE_SIZE = 50;

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);

  const [episodeComments, workComments] = await Promise.all([
    db
      .select({
        id: comments.id,
        body: comments.body,
        authorName: comments.authorName,
        parentId: comments.parentId,
        createdAt: comments.createdAt,
        slug: works.slug,
        workTitle: works.title,
        episodeNumber: episodes.episodeNumber,
        volumeNumber: episodes.volumeNumber,
      })
      .from(comments)
      .innerJoin(episodes, eq(episodes.id, comments.episodeId))
      .innerJoin(works, eq(works.id, episodes.workId))
      .where(isNotNull(comments.episodeId)),
    db
      .select({
        id: comments.id,
        body: comments.body,
        authorName: comments.authorName,
        parentId: comments.parentId,
        createdAt: comments.createdAt,
        slug: works.slug,
        workTitle: works.title,
      })
      .from(comments)
      .innerJoin(works, eq(works.id, comments.workId))
      .where(and(isNull(comments.episodeId), isNotNull(comments.workId))),
  ]);

  type Row = {
    id: number;
    body: string;
    authorName: string;
    parentId: number | null;
    createdAt: Date;
    href: string;
    label: string;
  };

  const rows: Row[] = [
    ...episodeComments.map((c) => ({
      id: c.id,
      body: c.body,
      authorName: c.authorName,
      parentId: c.parentId,
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
      authorName: c.authorName,
      parentId: c.parentId,
      createdAt: c.createdAt,
      href: `/works/${c.slug}/reviews`,
      label: `${c.workTitle} 作品全体`,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paginated = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">コメント管理</h1>
        <p className="text-sm text-gray-500 mt-1">計{rows.length}件</p>
      </div>

      {rows.length === 0 ? (
        <p className="text-gray-400 text-sm py-12 text-center">コメントはありません</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {paginated.map((row) => (
            <div key={row.id} className="px-4 py-3 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Link href={row.href} target="_blank" className="text-xs text-indigo-500 hover:underline">
                    {row.label}
                  </Link>
                  {row.parentId !== null && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">返信</span>
                  )}
                  <span className="text-xs text-gray-400">
                    {row.authorName} ・ {new Date(row.createdAt).toLocaleString("ja-JP")}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{row.body}</p>
              </div>
              <DeleteCommentButton commentId={row.id} />
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={`/admin/comments?page=${n}`}
              className={`w-8 h-8 flex items-center justify-center text-sm rounded-lg transition-colors ${
                page === n ? "bg-indigo-600 text-white" : "border border-gray-200 hover:border-indigo-300"
              }`}
            >
              {n}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
