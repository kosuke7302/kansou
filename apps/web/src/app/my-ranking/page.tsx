import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { favorites, works } from "@kansou/db";
import { eq, desc } from "drizzle-orm";
import { LoginPrompt } from "@/app/_components/login-prompt";
import { MyRankingEditor } from "@/app/_components/my-ranking-editor";
import { getMyRanking, getMyShareId } from "@/app/actions/ranking";

export const metadata: Metadata = {
  title: "Myランキング",
  robots: { index: false },
};

export default async function MyRankingPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <LoginPrompt message="Myランキングを作るにはログインが必要です" />;
  }

  const [favoriteRows, ranking, shareId] = await Promise.all([
    db
      .select({
        workId: favorites.workId,
        slug: works.slug,
        title: works.title,
        type: works.type,
      })
      .from(favorites)
      .innerJoin(works, eq(works.id, favorites.workId))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt)),
    getMyRanking(),
    getMyShareId(),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-head text-xl font-bold">Myランキング</h1>
        <p className="text-sm text-ink-muted mt-1">
          お気に入り登録した作品からTOP5を選んでシェアしよう
        </p>
      </div>
      <MyRankingEditor favorites={favoriteRows} initialRanking={ranking} initialShareId={shareId} />
    </div>
  );
}
