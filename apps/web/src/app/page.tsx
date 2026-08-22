import Link from "next/link";

const CONTENT_TYPES = [
  { key: "anime", label: "アニメ", emoji: "📺" },
  { key: "manga", label: "漫画", emoji: "📚" },
  { key: "drama", label: "ドラマ", emoji: "🎭" },
  { key: "movie", label: "映画", emoji: "🎬" },
] as const;

// TODO: Replace with DB fetch
const SAMPLE_WORKS = [
  { slug: "dragon-ball", title: "ドラゴンボール", type: "manga" as const, episodeCount: 519 },
  { slug: "evangelion", title: "新世紀エヴァンゲリオン", type: "anime" as const, episodeCount: 26 },
  { slug: "one-piece", title: "ワンピース", type: "manga" as const, episodeCount: 1100 },
  { slug: "gto", title: "GTO", type: "drama" as const, episodeCount: 12 },
  { slug: "kimetsu", title: "鬼滅の刃", type: "anime" as const, episodeCount: 26 },
  { slug: "spirited-away", title: "千と千尋の神隠し", type: "movie" as const, episodeCount: 1 },
];

const TYPE_STYLES: Record<string, string> = {
  anime: "bg-purple-100 text-purple-700",
  manga: "bg-blue-100 text-blue-700",
  drama: "bg-green-100 text-green-700",
  movie: "bg-orange-100 text-orange-700",
};

const TYPE_LABELS: Record<string, string> = {
  anime: "アニメ",
  manga: "漫画",
  drama: "ドラマ",
  movie: "映画",
};

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold mb-1">感想ログ</h1>
        <p className="text-gray-500 text-sm">
          アニメ・漫画・ドラマ・映画の話数ごとに感想を投稿・閲覧できるサイト
        </p>
      </section>

      <section>
        <div className="flex gap-2 flex-wrap mb-6">
          {CONTENT_TYPES.map((t) => (
            <span
              key={t.key}
              className={`px-3 py-1 rounded-full text-sm font-medium ${TYPE_STYLES[t.key]}`}
            >
              {t.emoji} {t.label}
            </span>
          ))}
        </div>

        <div className="grid gap-3">
          {SAMPLE_WORKS.map((work) => (
            <Link
              key={work.slug}
              href={`/works/${work.slug}`}
              className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[work.type]}`}
                >
                  {TYPE_LABELS[work.type]}
                </span>
                <span className="font-medium">{work.title}</span>
              </div>
              <span className="text-sm text-gray-400">{work.episodeCount}話</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
