/**
 * 架空・誤ったデータの削除、プラットフォームタグ修正
 */
import { createDb } from "./index";
import { works, episodes } from "./schema";
import { eq, inArray } from "drizzle-orm";

const DELETE_SLUGS = [
  "fumo-fumo-chan",      // フモフモさん - 架空
  "tokyo-er-drama",     // TOKYO ER - 実在不確か
  "liar-game-revival",  // ライアーゲーム THE REVIVAL - 実在不確か
];

const CLEAR_PLATFORM_SLUGS = [
  "spy-family-anime",       // SPY×FAMILY - 独占ではない
  "ossan-love-film",        // おっさんずラブ in the sky - TV朝日ドラマ、独占ではない
  "steins-gate-anime",      // シュタインズ・ゲート - 複数サービスで配信
  "rezero-s1",              // Re:ゼロ - 複数サービスで配信
  "oshi-ga-budoukan",       // 推しが武道館 - ABC TV放送、独占ではない
  "karakai-jouzu-takagi",   // からかい上手の高木さん - 複数サービスで配信
];

async function run() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL が設定されていません");
  const db = createDb(url);

  // 削除対象を確認
  console.log("── 削除対象の確認 ──");
  for (const slug of DELETE_SLUGS) {
    const [w] = await db.select({ id: works.id, title: works.title }).from(works).where(eq(works.slug, slug)).limit(1);
    if (!w) { console.log(`  スキップ（存在しない）: ${slug}`); continue; }

    await db.delete(episodes).where(eq(episodes.workId, w.id));
    await db.delete(works).where(eq(works.id, w.id));
    console.log(`  削除: ${w.title}（${slug}）`);
  }

  // プラットフォームタグをクリア
  console.log("\n── プラットフォームタグをクリア ──");
  for (const slug of CLEAR_PLATFORM_SLUGS) {
    const [w] = await db.select({ id: works.id, title: works.title, platform: works.platform }).from(works).where(eq(works.slug, slug)).limit(1);
    if (!w) { console.log(`  スキップ（存在しない）: ${slug}`); continue; }

    await db.update(works).set({ platform: null }).where(eq(works.id, w.id));
    console.log(`  クリア: ${w.title}（${w.platform} → なし）`);
  }

  console.log("\n完了");
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
