import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { works, episodes } from "@kansou/db";
import { eq, asc } from "drizzle-orm";

const TYPE_LABELS: Record<string, string> = {
  anime: "アニメ", manga: "漫画", drama: "ドラマ", movie: "映画",
};
const TYPE_STYLES: Record<string, string> = {
  anime: "bg-purple-100 text-purple-700",
  manga: "bg-blue-100 text-blue-700",
  drama: "bg-green-100 text-green-700",
  movie: "bg-orange-100 text-orange-700",
};

export async function generateMetadata({ params }: PageProps<"/works/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [work] = await db.select().from(works).where(eq(works.slug, slug)).limit(1);
  if (!work) return {};
  return {
    title: `${work.title} 感想`,
    description: `${work.title}の話数ごとの感想・レビューまとめ。`,
  };
}

export default async function WorkPage({ params }: PageProps<"/works/[slug]">) {
  const { slug } = await params;

  const [work] = await db.select().from(works).where(eq(works.slug, slug)).limit(1);
  if (!work) notFound();

  const eps = await db
    .select()
    .from(episodes)
    .where(eq(episodes.workId, work.id))
    .orderBy(asc(episodes.episodeNumber));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-indigo-500 hover:underline">← 作品一覧</Link>
        <div className="flex items-center gap-3 mt-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[work.type]}`}>
            {TYPE_LABELS[work.type]}
          </span>
          <h1 className="text-2xl font-bold">{work.title}</h1>
        </div>
        {work.description && (
          <p className="text-gray-500 text-sm mt-1">{work.description}</p>
        )}
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">話数一覧</h2>
        {eps.length === 0 ? (
          <p className="text-gray-400 text-sm">話数データがありません</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {eps.map((ep) => (
              <Link
                key={ep.id}
                href={`/works/${slug}/episodes/${ep.episodeNumber}`}
                className="flex items-center justify-center bg-white border border-gray-200 rounded-lg py-2 text-sm hover:border-indigo-300 hover:bg-indigo-50 transition-all"
              >
                {work.type === "movie" ? "本編" : `第${ep.episodeNumber}話`}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
