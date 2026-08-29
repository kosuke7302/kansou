import Link from "next/link";
import { db } from "@/lib/db";
import { works, episodes } from "@kansou/db";
import { eq, count } from "drizzle-orm";
import { DeleteWorkButton } from "./_components/delete-work-button";

const TYPE_LABELS: Record<string, string> = {
  manga: "漫画", anime: "アニメ", drama: "ドラマ", movie: "映画",
};
const TYPE_COLORS: Record<string, string> = {
  manga: "bg-blue-100 text-blue-700",
  anime: "bg-purple-100 text-purple-700",
  drama: "bg-green-100 text-green-700",
  movie: "bg-orange-100 text-orange-700",
};

export default async function AdminWorksPage() {
  const rows = await db
    .select({ id: works.id, title: works.title, slug: works.slug, type: works.type, platforms: works.platforms, episodeCount: count(episodes.id) })
    .from(works)
    .leftJoin(episodes, eq(episodes.workId, works.id))
    .groupBy(works.id, works.title, works.slug, works.type, works.platforms)
    .orderBy(works.type, works.title);

  const counts = rows.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">作品一覧</h1>
          <p className="text-sm text-gray-500 mt-1">
            計{rows.length}作品 —
            {Object.entries(counts).map(([type, n]) => ` ${TYPE_LABELS[type]}${n}`).join(" /")}
          </p>
        </div>
        <Link
          href="/admin/works/new"
          className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + 作品追加
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">タイトル</th>
              <th className="px-4 py-3 text-left">スラグ</th>
              <th className="px-4 py-3 text-left">ジャンル</th>
              <th className="px-4 py-3 text-right">話数/巻数</th>
              <th className="px-4 py-3 text-left">配信</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <Link href={`/works/${row.slug}`} target="_blank" className="hover:text-indigo-600">
                    {row.title}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">{row.slug}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[row.type]}`}>
                    {TYPE_LABELS[row.type]}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right text-gray-500">{row.episodeCount}</td>
                <td className="px-4 py-2.5 text-xs text-gray-400">
                  {(row.platforms ?? [])
                    .map((p) => ({ netflix: "Netflix", amazon_prime: "Prime", disney_plus: "Disney+", hulu: "Hulu", u_next: "U-NEXT", d_anime: "dアニメ", abema: "ABEMA", lemino: "Lemino", fod: "FOD" } as Record<string, string>)[p ?? ""] ?? "")
                    .filter(Boolean)
                    .join(", ")}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/works/${row.id}`} className="text-xs text-indigo-500 hover:underline">
                      編集
                    </Link>
                    <DeleteWorkButton workId={row.id} title={row.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
