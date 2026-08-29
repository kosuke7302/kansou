import Link from "next/link";
import { db } from "@/lib/db";
import { works, episodes } from "@kansou/db";
import { eq, count, isNull, and, arrayContains, type SQL } from "drizzle-orm";
import { DeleteWorkButton } from "./_components/delete-work-button";
import { filmarksSearchUrl } from "@/lib/filmarks";

const TYPE_LABELS: Record<string, string> = {
  manga: "漫画", anime: "アニメ", drama: "ドラマ", movie: "映画",
};
const TYPE_COLORS: Record<string, string> = {
  manga: "bg-blue-100 text-blue-700",
  anime: "bg-purple-100 text-purple-700",
  drama: "bg-green-100 text-green-700",
  movie: "bg-orange-100 text-orange-700",
};
const PLATFORM_LABELS: Record<string, string> = {
  netflix: "Netflix", amazon_prime: "Prime", disney_plus: "Disney+", hulu: "Hulu",
  u_next: "U-NEXT", d_anime: "dアニメ", abema: "ABEMA", lemino: "Lemino", fod: "FOD",
  tver: "TVer", dmm_tv: "DMM TV", telasa: "TELASA", anime_times: "アニメタイムズ",
};

const GENRE_TABS = [
  { key: "", label: "すべて" },
  { key: "anime", label: "アニメ" },
  { key: "manga", label: "漫画" },
  { key: "drama", label: "ドラマ" },
  { key: "movie", label: "映画" },
];

const STALE_DAYS = 90;

function buildQuery(type: string, platform: string) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (platform) params.set("platform", platform);
  const qs = params.toString();
  return qs ? `/admin/works?${qs}` : "/admin/works";
}

export default async function AdminWorksPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; platform?: string }>;
}) {
  const { type = "", platform = "" } = await searchParams;

  const conditions: SQL[] = [];
  if (type && type in TYPE_LABELS) {
    conditions.push(eq(works.type, type as "manga" | "anime" | "drama" | "movie"));
  }
  if (platform === "missing") {
    conditions.push(isNull(works.platforms));
  } else if (platform && platform in PLATFORM_LABELS) {
    conditions.push(arrayContains(works.platforms, [platform]));
  }

  const rows = await db
    .select({
      id: works.id, title: works.title, slug: works.slug, type: works.type,
      platforms: works.platforms, platformsUpdatedAt: works.platformsUpdatedAt,
      fromRequest: works.fromRequest,
      episodeCount: count(episodes.id),
    })
    .from(works)
    .leftJoin(episodes, eq(episodes.workId, works.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(works.id, works.title, works.slug, works.type, works.platforms, works.platformsUpdatedAt, works.fromRequest)
    .orderBy(works.type, works.title);

  const allRows = await db
    .select({ type: works.type })
    .from(works);
  const counts = allRows.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const staleCutoff = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">作品一覧</h1>
          <p className="text-sm text-gray-500 mt-1">
            計{allRows.length}作品 —
            {Object.entries(counts).map(([t, n]) => ` ${TYPE_LABELS[t]}${n}`).join(" /")}
            {(type || platform) && <span className="ml-2 text-indigo-500">（絞り込み中: {rows.length}件）</span>}
          </p>
        </div>
        <Link
          href="/admin/works/new"
          className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + 作品追加
        </Link>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2 flex-wrap">
          {GENRE_TABS.map((tab) => (
            <Link
              key={tab.key}
              href={buildQuery(tab.key, platform)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                type === tab.key ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">配信サービス:</span>
          <Link
            href={buildQuery(type, "")}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              platform === "" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"
            }`}
          >
            すべて
          </Link>
          <Link
            href={buildQuery(type, "missing")}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              platform === "missing" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"
            }`}
          >
            未設定
          </Link>
          {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
            <Link
              key={key}
              href={buildQuery(type, key)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                platform === key ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">タイトル</th>
              <th className="px-4 py-3 text-left">スラグ</th>
              <th className="px-4 py-3 text-left">ジャンル</th>
              <th className="px-4 py-3 text-right">話数/巻数</th>
              <th className="px-4 py-3 text-left">配信</th>
              <th className="px-4 py-3 text-left">配信タグ更新日</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => {
              const isStale = row.platformsUpdatedAt !== null && new Date(row.platformsUpdatedAt).getTime() < staleCutoff;
              return (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <Link href={`/works/${row.slug}`} target="_blank" className="hover:text-indigo-600">
                      {row.title}
                    </Link>
                    {row.fromRequest && (
                      <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-500">
                        リクエスト由来
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">{row.slug}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[row.type]}`}>
                      {TYPE_LABELS[row.type]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-500">{row.episodeCount}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-400">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>
                        {(row.platforms ?? [])
                          .map((p) => PLATFORM_LABELS[p ?? ""] ?? "")
                          .filter(Boolean)
                          .join(", ") || "―"}
                      </span>
                      {filmarksSearchUrl(row.type, row.title) && (
                        <a
                          href={filmarksSearchUrl(row.type, row.title)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-600 hover:underline shrink-0"
                        >
                          Filmarksで確認 →
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs whitespace-nowrap">
                    {row.platformsUpdatedAt ? (
                      <span className={isStale ? "text-amber-600" : "text-gray-400"}>
                        {isStale && "⚠️ "}
                        {new Date(row.platformsUpdatedAt).toLocaleDateString("ja-JP")}
                      </span>
                    ) : (
                      <span className="text-gray-300">―</span>
                    )}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
