import { createDb } from "./index";
import { works, episodes } from "./schema";
import { eq, and, isNotNull } from "drizzle-orm";

async function run() {
  const db = createDb(process.env.DATABASE_URL!);

  const [work] = await db.select().from(works).where(eq(works.slug, "kochikame")).limit(1);
  if (!work) { console.log("こち亀が見つかりません"); process.exit(0); }

  const withTitle = await db.select().from(episodes)
    .where(and(eq(episodes.workId, work.id), isNotNull(episodes.title)));

  console.log(`タイトルあり: ${withTitle.length}件`);
  withTitle.forEach(e => console.log(`  第${e.episodeNumber}話: ${e.title}`));

  await db.update(episodes)
    .set({ title: null })
    .where(and(eq(episodes.workId, work.id), isNotNull(episodes.title)));

  console.log("クリア完了");
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
