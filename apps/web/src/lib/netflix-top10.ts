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

// 全世界・全期間ぶんで32MB超・50万行超あり年々増え続けるため、全量をメモリに載せて
// フィルタすると関数のタイムアウト(maxDuration)に引っかかる。ファイルが
// 「国名のアルファベット順→週の新しい順」で並んでいることを利用し、ストリーミングで
// 読みながらJapanの塊だけ拾い、そこを通過した時点で以降のダウンロードを打ち切る。
async function fetchJapanRows(): Promise<{ header: string[]; rows: string[][] }> {
  const res = await fetch(TSV_URL, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok || !res.body) {
    throw new Error(`Netflix Top10 TSVの取得に失敗しました: HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let header: string[] | null = null;
  let countryIdx = -1;
  const rows: string[][] = [];
  let seenJapan = false;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newlineIndex).replace(/\r$/, "");
        buffer = buffer.slice(newlineIndex + 1);
        if (!line.trim()) continue;
        const cols = line.split("\t");

        if (!header) {
          header = cols;
          countryIdx = header.indexOf("country_name");
          if (countryIdx === -1) {
            throw new Error("Netflix Top10 TSVの想定していた列がありません: country_name");
          }
          continue;
        }

        if (cols[countryIdx] === "Japan") {
          seenJapan = true;
          rows.push(cols);
        } else if (seenJapan) {
          return { header, rows }; // Japanの塊を通過し終えたので以降は不要
        }
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }

  if (!header) throw new Error("Netflix Top10 TSVが空です");
  return { header, rows };
}

export async function fetchNetflixTop10Japan(): Promise<NetflixTop10Japan> {
  const { header, rows: japanRows } = await fetchJapanRows();
  if (japanRows.length === 0) throw new Error("Netflix Top10に日本のデータが見つかりませんでした");

  const col = (name: string) => {
    const i = header.indexOf(name);
    if (i === -1) throw new Error(`Netflix Top10 TSVの想定していた列がありません: ${name}`);
    return i;
  };
  const weekIdx = col("week");
  const categoryIdx = col("category");
  const rankIdx = col("weekly_rank");
  const titleIdx = col("show_title");
  const seasonIdx = col("season_title");
  const weeksIdx = col("cumulative_weeks_in_top_10");

  const latestWeek = japanRows.map((c) => c[weekIdx]).sort().at(-1)!;

  // ストリーミングの前提（国別アルファベット順→週降順）が崩れていた場合の異常検知。
  // 想定と違うデータを取得し続けるより、明示的に失敗させて気づけるようにする。
  const daysSinceLatestWeek = (Date.now() - new Date(latestWeek).getTime()) / 86_400_000;
  if (Number.isNaN(daysSinceLatestWeek) || daysSinceLatestWeek > 21) {
    throw new Error(
      `Netflix Top10の最新週(${latestWeek})が古すぎます。TSVのファイル構造が変わった可能性があります`
    );
  }

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
