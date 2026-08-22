import { createDb } from "./index";
import { works, episodes } from "./schema";

const WORKS_DATA = [
  { slug: "dragon-ball", title: "ドラゴンボール", type: "manga" as const, description: "鳥山明による漫画作品。少年悟空の冒険を描く。", episodeCount: 42 },
  { slug: "evangelion", title: "新世紀エヴァンゲリオン", type: "anime" as const, description: "庵野秀明監督。少年少女が巨大人型兵器で戦うSFアニメ。", episodeCount: 26 },
  { slug: "one-piece", title: "ワンピース", type: "manga" as const, description: "尾田栄一郎による海賊冒険漫画。", episodeCount: 110 },
  { slug: "gto", title: "GTO", type: "drama" as const, description: "藤沢とおる原作。元不良が教師になるドラマ。", episodeCount: 12 },
  { slug: "kimetsu", title: "鬼滅の刃", type: "anime" as const, description: "吾峠呼世晴原作。大正時代を舞台にした鬼殺しのアニメ。", episodeCount: 26 },
  { slug: "spirited-away", title: "千と千尋の神隠し", type: "movie" as const, description: "宮崎駿監督のスタジオジブリ映画。", episodeCount: 1 },
  { slug: "attack-on-titan", title: "進撃の巨人", type: "anime" as const, description: "諫山創原作。人類と巨人の戦いを描く。", episodeCount: 87 },
  { slug: "death-note", title: "デスノート", type: "manga" as const, description: "大場つぐみ・小畑健による心理サスペンス漫画。", episodeCount: 108 },
  { slug: "hanzawa-naoki", title: "半沢直樹", type: "drama" as const, description: "池井戸潤原作。銀行員の倍返しドラマ。", episodeCount: 10 },
  { slug: "your-name", title: "君の名は。", type: "movie" as const, description: "新海誠監督のアニメ映画。", episodeCount: 1 },
  { slug: "naruto", title: "NARUTO", type: "manga" as const, description: "岸本斉史による忍者漫画。", episodeCount: 72 },
  { slug: "hunter-x-hunter", title: "ハンターxハンター", type: "manga" as const, description: "冨樫義博による冒険漫画。", episodeCount: 401 },
];

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL が設定されていません");

  const db = createDb(url);
  console.log("シードデータを投入中...");

  for (const work of WORKS_DATA) {
    const { episodeCount, ...workData } = work;

    const [inserted] = await db
      .insert(works)
      .values(workData)
      .onConflictDoNothing()
      .returning();

    if (!inserted) {
      console.log(`スキップ（既存）: ${work.title}`);
      continue;
    }

    const epValues = Array.from({ length: episodeCount }, (_, i) => ({
      workId: inserted.id,
      episodeNumber: i + 1,
    }));

    await db.insert(episodes).values(epValues).onConflictDoNothing();
    console.log(`✓ ${work.title}（${episodeCount}話）`);
  }

  console.log("完了！");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
