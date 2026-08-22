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

const BASE_URL = "https://kansou-web-dzqj.vercel.app";

export async function generateMetadata({ params }: PageProps<"/works/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [work] = await db.select().from(works).where(eq(works.slug, slug)).limit(1);
  if (!work) return {};
  const title = `${work.title} 感想`;
  const description = `${work.title}の話数ごとの感想・レビュー・考察まとめ。ネタバレあり。`;
  const url = `${BASE_URL}/works/${slug}`;
  return {
    title,
    description,
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: "感想ログ",
      locale: "ja_JP",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
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
    .orderBy(asc(episodes.volumeNumber), asc(episodes.episodeNumber));

  const isManga = work.type === "manga";
  const isMovie = work.type === "movie";

  // Group chapters by volume for manga; separate volume entries (episodeNumber=null)
  const volumeGroups: Map<number, typeof eps> = new Map();
  const volumeEntries: Map<number, (typeof eps)[0]> = new Map();
  if (isManga) {
    for (const ep of eps) {
      const vol = ep.volumeNumber ?? 0;
      if (ep.episodeNumber === null) {
        volumeEntries.set(vol, ep);
      } else {
        if (!volumeGroups.has(vol)) volumeGroups.set(vol, []);
        volumeGroups.get(vol)!.push(ep);
      }
    }
  }

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
        <h2 className="text-lg font-semibold mb-3">
          {isManga ? "巻・話一覧" : isMovie ? "作品" : "話数一覧"}
        </h2>

        {eps.length === 0 ? (
          <p className="text-gray-400 text-sm">データがありません</p>
        ) : isManga ? (
          <div className="space-y-4">
            {Array.from(volumeGroups.entries()).map(([vol, chapters]) => (
              <details key={vol} className="group border border-gray-200 rounded-lg bg-white overflow-hidden">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-gray-50 transition-colors list-none">
                  <span className="font-medium text-sm">
                    第{vol}巻
                    <span className="ml-2 text-xs text-gray-400 font-normal">
                      第{chapters[0].episodeNumber}話〜第{chapters[chapters.length - 1].episodeNumber}話（{chapters.length}話）
                    </span>
                  </span>
                  <svg className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 pt-3 border-t border-gray-100 space-y-3">
                  {volumeEntries.has(vol) && (
                    <Link
                      href={`/works/${slug}/volumes/${vol}`}
                      className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      第{vol}巻をまとめて語る
                    </Link>
                  )}
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {chapters.map((ch) => (
                      <Link
                        key={ch.id}
                        href={`/works/${slug}/episodes/${ch.episodeNumber}`}
                        title={ch.title ?? undefined}
                        className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg py-2 text-xs hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                      >
                        {ch.episodeNumber}話
                      </Link>
                    ))}
                  </div>
                </div>
              </details>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {eps.map((ep) => (
              <Link
                key={ep.id}
                href={`/works/${slug}/episodes/${ep.episodeNumber}`}
                title={ep.title ?? undefined}
                className="flex items-center justify-center bg-white border border-gray-200 rounded-lg py-2 text-sm hover:border-indigo-300 hover:bg-indigo-50 transition-all"
              >
                {isMovie ? "本編" : `第${ep.episodeNumber}話`}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
