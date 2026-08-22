import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// TODO: Replace with DB fetch
const SAMPLE_WORKS: Record<string, { title: string; type: string; description: string; episodeCount: number }> = {
  "dragon-ball": { title: "ドラゴンボール", type: "manga", description: "鳥山明による日本の漫画作品。", episodeCount: 42 },
  "evangelion": { title: "新世紀エヴァンゲリオン", type: "anime", description: "庵野秀明監督のアニメ作品。", episodeCount: 26 },
  "one-piece": { title: "ワンピース", type: "manga", description: "尾田栄一郎による漫画作品。", episodeCount: 110 },
  "gto": { title: "GTO", type: "drama", description: "藤沢とおる原作のドラマ。", episodeCount: 12 },
  "kimetsu": { title: "鬼滅の刃", type: "anime", description: "吾峠呼世晴原作のアニメ。", episodeCount: 26 },
  "spirited-away": { title: "千と千尋の神隠し", type: "movie", description: "宮崎駿監督の映画作品。", episodeCount: 1 },
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

export async function generateMetadata({ params }: PageProps<"/works/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const work = SAMPLE_WORKS[slug];
  if (!work) return {};
  return {
    title: `${work.title} 感想`,
    description: `${work.title}の話数ごとの感想・レビューまとめ。`,
  };
}

export default async function WorkPage({ params }: PageProps<"/works/[slug]">) {
  const { slug } = await params;
  const work = SAMPLE_WORKS[slug];
  if (!work) notFound();

  const episodes = Array.from({ length: work.episodeCount }, (_, i) => i + 1);

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
        <p className="text-gray-500 text-sm mt-1">{work.description}</p>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">話数一覧</h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {episodes.map((ep) => (
            <Link
              key={ep}
              href={`/works/${slug}/episodes/${ep}`}
              className="flex items-center justify-center bg-white border border-gray-200 rounded-lg py-2 text-sm hover:border-indigo-300 hover:bg-indigo-50 transition-all"
            >
              {work.type === "movie" ? "本編" : `第${ep}話`}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
