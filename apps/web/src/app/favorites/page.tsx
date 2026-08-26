import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { favorites, works } from "@kansou/db";
import { eq, desc } from "drizzle-orm";
import { LoginPrompt } from "@/app/_components/login-prompt";

export const metadata: Metadata = {
  title: "お気に入り",
  robots: { index: false },
};

const TYPE_LABELS: Record<string, string> = {
  anime: "アニメ", manga: "漫画", drama: "ドラマ", movie: "映画",
};
const TYPE_STYLES: Record<string, string> = {
  anime: "bg-purple-100 text-purple-700",
  manga: "bg-blue-100 text-blue-700",
  drama: "bg-green-100 text-green-700",
  movie: "bg-orange-100 text-orange-700",
};

export default async function FavoritesPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <LoginPrompt message="お気に入りを見るにはログインが必要です" />
    );
  }

  const rows = await db
    .select({
      slug: works.slug,
      title: works.title,
      type: works.type,
      favoritedAt: favorites.createdAt,
    })
    .from(favorites)
    .innerJoin(works, eq(works.id, favorites.workId))
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt));

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">お気に入り</h1>
      {rows.length === 0 ? (
        <p className="text-gray-400 text-sm py-12 text-center">
          お気に入りに登録した作品はまだありません
        </p>
      ) : (
        <div className="grid gap-2">
          {rows.map((work) => (
            <Link
              key={work.slug}
              href={`/works/${work.slug}`}
              className="flex items-center gap-3 min-w-0 bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[work.type]}`}>
                {TYPE_LABELS[work.type]}
              </span>
              <span className="font-medium truncate min-w-0">{work.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
