import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// TODO: Replace with DB fetch
const SAMPLE_WORKS: Record<string, { title: string; type: string }> = {
  "dragon-ball": { title: "ドラゴンボール", type: "manga" },
  "evangelion": { title: "新世紀エヴァンゲリオン", type: "anime" },
  "one-piece": { title: "ワンピース", type: "manga" },
  "gto": { title: "GTO", type: "drama" },
  "kimetsu": { title: "鬼滅の刃", type: "anime" },
  "spirited-away": { title: "千と千尋の神隠し", type: "movie" },
};

// TODO: Replace with DB fetch
const SAMPLE_COMMENTS = [
  { id: 1, authorName: "名無し", body: "この話は神回だった。ラストシーンで鳥肌が立った", createdAt: "2024-01-15" },
  { id: 2, authorName: "名無し", body: "伏線の回収が見事すぎる。何度見ても面白い", createdAt: "2024-02-03" },
  { id: 3, authorName: "名無し", body: "主人公の成長がよく描かれていると思う", createdAt: "2024-03-10" },
];

export async function generateMetadata({
  params,
}: PageProps<"/works/[slug]/episodes/[episodeNumber]">): Promise<Metadata> {
  const { slug, episodeNumber } = await params;
  const work = SAMPLE_WORKS[slug];
  if (!work) return {};
  const label = work.type === "movie" ? "本編" : `第${episodeNumber}話`;
  return {
    title: `${work.title} ${label} 感想`,
    description: `${work.title} ${label}の感想・考察スレッド。`,
  };
}

export default async function EpisodePage({
  params,
}: PageProps<"/works/[slug]/episodes/[episodeNumber]">) {
  const { slug, episodeNumber } = await params;
  const work = SAMPLE_WORKS[slug];
  if (!work) notFound();

  const epNum = Number(episodeNumber);
  if (isNaN(epNum) || epNum < 1) notFound();

  const label = work.type === "movie" ? "本編" : `第${epNum}話`;

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/works/${slug}`} className="text-sm text-indigo-500 hover:underline">
          ← {work.title}
        </Link>
        <h1 className="text-2xl font-bold mt-2">
          {work.title} {label} 感想
        </h1>
        <p className="text-gray-500 text-sm mt-1">{SAMPLE_COMMENTS.length}件のコメント</p>
      </div>

      <section className="space-y-3">
        {SAMPLE_COMMENTS.map((comment) => (
          <div key={comment.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-medium text-gray-600">{comment.authorName}</span>
              <span className="text-xs text-gray-400">{comment.createdAt}</span>
            </div>
            <p className="text-sm leading-relaxed">{comment.body}</p>
          </div>
        ))}
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-sm font-semibold mb-3">感想を投稿する</h2>
        {/* TODO: Server Action で投稿処理 */}
        <form className="space-y-3">
          <textarea
            name="body"
            placeholder="感想を書いてください（ネタバレ注意）"
            rows={4}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            投稿する
          </button>
        </form>
      </section>
    </div>
  );
}
