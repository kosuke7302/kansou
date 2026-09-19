import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { rankingProfiles, rankingEntries, works } from "@kansou/db";
import { eq, asc } from "drizzle-orm";
import { ShareButtons } from "@/app/_components/share-buttons";

const BASE_URL = "https://www.kansou-log.com";

export const revalidate = 3600;
export const dynamic = "force-static";

const TYPE_LABELS: Record<string, string> = {
  anime: "アニメ", manga: "漫画", drama: "ドラマ", movie: "映画",
};
const TYPE_STYLES: Record<string, string> = {
  anime: "bg-purple-100 text-purple-700",
  manga: "bg-blue-100 text-blue-700",
  drama: "bg-green-100 text-green-700",
  movie: "bg-orange-100 text-orange-700",
};

type Params = Promise<{ shareId: string }>;

async function getRanking(shareId: string) {
  const [profile] = await db
    .select({ title: rankingProfiles.title })
    .from(rankingProfiles)
    .where(eq(rankingProfiles.shareId, shareId))
    .limit(1);
  if (!profile) return null;

  const entries = await db
    .select({
      position: rankingEntries.position,
      slug: works.slug,
      title: works.title,
      type: works.type,
    })
    .from(rankingEntries)
    .innerJoin(works, eq(works.id, rankingEntries.workId))
    .innerJoin(rankingProfiles, eq(rankingProfiles.userId, rankingEntries.userId))
    .where(eq(rankingProfiles.shareId, shareId))
    .orderBy(asc(rankingEntries.position));

  return { title: profile.title, entries };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { shareId } = await params;
  const ranking = await getRanking(shareId);
  if (!ranking || ranking.entries.length === 0) return {};

  const description = ranking.entries.map((e, i) => `${i + 1}位: ${e.title}`).join(" / ");
  const url = `${BASE_URL}/ranking/${shareId}`;
  return {
    title: `${ranking.title} | 感想ログ`,
    description,
    openGraph: { type: "website", title: ranking.title, description, url, siteName: "感想ログ", locale: "ja_JP" },
    twitter: { card: "summary_large_image", title: ranking.title, description },
    alternates: { canonical: url },
  };
}

export default async function RankingPage({ params }: { params: Params }) {
  const { shareId } = await params;
  const ranking = await getRanking(shareId);
  if (!ranking || ranking.entries.length === 0) notFound();

  const pageUrl = `${BASE_URL}/ranking/${shareId}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{ranking.title}</h1>
        <div className="mt-2">
          <ShareButtons title={ranking.title} url={pageUrl} />
        </div>
      </div>

      <div className="grid gap-2">
        {ranking.entries.map((entry) => (
          <Link
            key={entry.slug}
            href={`/works/${entry.slug}`}
            className="flex items-center gap-3 min-w-0 bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <span className="w-6 text-center text-lg font-bold text-indigo-500 shrink-0">{entry.position}</span>
            <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[entry.type]}`}>
              {TYPE_LABELS[entry.type]}
            </span>
            <span className="font-medium truncate min-w-0">{entry.title}</span>
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400">
        <Link href="/my-ranking" className="text-indigo-500 hover:underline">
          あなたもMyランキングを作る →
        </Link>
      </p>
    </div>
  );
}
