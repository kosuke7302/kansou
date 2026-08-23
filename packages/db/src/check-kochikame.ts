import { createDb } from "./index";
import { works, episodes } from "./schema";
import { ilike, or, eq, isNotNull, asc } from "drizzle-orm";

async function run() {
  const db = createDb(process.env.DATABASE_URL!);

  const [work] = await db.select().from(works).where(
    or(ilike(works.title, "%こち亀%"), ilike(works.slug, "%kochi%"))
  ).limit(1);

  if (!work) { console.log("こち亀が見つかりません"); process.exit(0); }
  console.log("作品:", work.id, work.slug, work.title, work.type);

  // タイトルが設定されているエピソードのみ表示
  const eps = await db.select().from(episodes)
    .where(eq(episodes.workId, work.id))
    .orderBy(asc(episodes.volumeNumber), asc(episodes.episodeNumber));

  const withTitle = eps.filter(e => e.title);
  console.log(`\n話数: 計${eps.length}件 / タイトルあり: ${withTitle.length}件`);

  if (withTitle.length > 0) {
    console.log("\n── タイトル付きエピソード ──");
    withTitle.forEach(e => {
      console.log(`  ${e.volumeNumber ? `第${e.volumeNumber}巻` : `第${e.episodeNumber}話`}: ${e.title}`);
    });
  }

  // 最初の10件を表示
  console.log("\n── 最初の10件 ──");
  eps.slice(0, 10).forEach(e => {
    const label = e.volumeNumber != null ? `第${e.volumeNumber}巻` : `第${e.episodeNumber}話`;
    console.log(`  id=${e.id} ${label} title=${e.title ?? "null"}`);
  });

  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
