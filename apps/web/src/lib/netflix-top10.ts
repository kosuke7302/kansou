// Netflix公式Top10 (https://www.netflix.com/tudum/top10) が一般公開しているTSVデータを取得する。
// スクレイピングではなく、Netflix自身がダウンロード用に配布している公開ファイル。
const TSV_URL = "https://www.netflix.com/tudum/top10/data/all-weeks-countries.tsv";

export type NetflixTop10Row = {
  rank: number;
  title: string;
  seasonTitle: string | null;
  weeksInTop10: number;
};

export type NetflixTop10Japan = {
  weekOf: string; // "2026-08-23" (集計対象週の開始日)
  tv: NetflixTop10Row[];
  films: NetflixTop10Row[];
};

export async function fetchNetflixTop10Japan(): Promise<NetflixTop10Japan> {
  const res = await fetch(TSV_URL, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) {
    throw new Error(`Netflix Top10 TSVの取得に失敗しました: HTTP ${res.status}`);
  }
  const text = await res.text();
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) throw new Error("Netflix Top10 TSVが空です");

  const header = lines[0].split("\t");
  const col = (name: string) => {
    const i = header.indexOf(name);
    if (i === -1) throw new Error(`Netflix Top10 TSVの想定していた列がありません: ${name}`);
    return i;
  };
  const countryIdx = col("country_name");
  const weekIdx = col("week");
  const categoryIdx = col("category");
  const rankIdx = col("weekly_rank");
  const titleIdx = col("show_title");
  const seasonIdx = col("season_title");
  const weeksIdx = col("cumulative_weeks_in_top_10");

  const japanRows = lines
    .slice(1)
    .map((l) => l.split("\t"))
    .filter((c) => c[countryIdx] === "Japan");

  if (japanRows.length === 0) throw new Error("Netflix Top10に日本のデータが見つかりませんでした");

  const latestWeek = japanRows.map((c) => c[weekIdx]).sort().at(-1)!;
  const latestRows = japanRows.filter((c) => c[weekIdx] === latestWeek);

  const toRow = (c: string[]): NetflixTop10Row => ({
    rank: Number(c[rankIdx]),
    title: c[titleIdx],
    seasonTitle: c[seasonIdx] === "N/A" ? null : c[seasonIdx],
    weeksInTop10: Number(c[weeksIdx]),
  });

  const byRank = (a: NetflixTop10Row, b: NetflixTop10Row) => a.rank - b.rank;

  return {
    weekOf: latestWeek,
    tv: latestRows.filter((c) => c[categoryIdx] === "TV").map(toRow).sort(byRank),
    films: latestRows.filter((c) => c[categoryIdx] === "Films").map(toRow).sort(byRank),
  };
}
