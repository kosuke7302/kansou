/**
 * 既存データを消さずに新しい作品を追加するスクリプト
 * 重複スラグはスキップされる
 */
import { createDb } from "./index";
import { works, episodes } from "./schema";
import { eq } from "drizzle-orm";

type MangaAdd = {
  slug: string;
  title: string;
  description: string;
  volumes: number;
  chapters?: number;
};

type WorkAdd = {
  slug: string;
  title: string;
  type: "anime" | "drama" | "movie";
  platform?: "netflix" | "amazon_prime" | "disney_plus";
  description: string;
  episodeCount: number;
};

// ── 完結済み漫画（未登録分）──────────────────────────────────
const NEW_MANGA: MangaAdd[] = [
  { slug: "monster-manga", title: "Monster", description: "浦沢直樹による心理サスペンス漫画。天才外科医とその手術で救った少年の数奇な運命。", volumes: 18, chapters: 162 },
  { slug: "20th-century-boys", title: "20世紀少年", description: "浦沢直樹によるSFサスペンス。幼少期の「よげんの書」が現実になる大人たちの戦い。", volumes: 22, chapters: 249 },
  { slug: "pluto-manga", title: "PLUTO", description: "浦沢直樹×手塚治虫。鉄腕アトムのエピソードを再解釈した哲学的SF漫画。全8巻。", volumes: 8, chapters: 65 },
  { slug: "hikaru-no-go", title: "ヒカルの碁", description: "ほったゆみ・小畑健による囲碁漫画。平安の棋士に憑かれた少年の成長を描く。", volumes: 23, chapters: 189 },
  { slug: "yu-gi-oh", title: "遊☆戯☆王", description: "高橋和希による対戦ゲームをテーマにした少年漫画。千年パズルと影の遊戯の物語。", volumes: 38, chapters: 343 },
  { slug: "shaman-king", title: "シャーマンキング", description: "武井宏之による霊能者バトル漫画。シャーマンキングを目指す主人公・葉の冒険。", volumes: 32, chapters: 300 },
  { slug: "reborn", title: "家庭教師ヒットマンREBORN!", description: "天野明によるマフィア×バトル漫画。落ちこぼれ少年ツナとリボーンのコンビ。", volumes: 42, chapters: 409 },
  { slug: "eyeshield-21", title: "アイシールド21", description: "稲垣理一郎・村田雄介によるアメフト漫画。ひ弱な少年セナが最速のランナーになる物語。", volumes: 37, chapters: 333 },
  { slug: "major-manga", title: "MAJOR", description: "満田拓也による野球漫画。父の夢を継いだ茂野吾郎の野球人生を描く大河作品。", volumes: 78, chapters: 154 },
  { slug: "touch-manga", title: "タッチ", description: "あだち充による野球＆恋愛漫画。双子の兄弟と幼なじみの少女の青春を描く名作。", volumes: 26, chapters: 177 },
  { slug: "h2-manga", title: "H2", description: "あだち充による野球漫画。ライバルでもある二人の男と二人の女の青春群像劇。", volumes: 34, chapters: 338 },
  { slug: "cardcaptor-sakura", title: "カードキャプターさくら", description: "CLAMPによる魔法少女漫画。クロウカードを集める小学生・木之本桜の物語。", volumes: 12, chapters: 50 },
  { slug: "ouran-host-club", title: "桜蘭高校ホスト部", description: "葉鳥ビスコによる逆ハーレム×コメディ漫画。事故でホスト部のツボを壊した少女の物語。", volumes: 18, chapters: 83 },
  { slug: "assassination-classroom", title: "暗殺教室", description: "松井優征による学園バトル漫画。人類を滅ぼすと宣言した超生物を生徒たちが暗殺する。", volumes: 21, chapters: 185 },
  { slug: "erased", title: "僕だけがいない街", description: "三部けいによるタイムリープサスペンス漫画。過去に飛んで連続誘拐事件を防ごうとする男の物語。", volumes: 8, chapters: 44 },
  { slug: "initial-d", title: "頭文字D", description: "しげの秀一による峠バトル漫画。豆腐屋の息子・拓海が高橋ガレオン破りで頂点を目指す。", volumes: 48, chapters: 716 },
  { slug: "gto-manga", title: "GTO", description: "藤沢とおるによる元不良の熱血教師・鬼塚英吉が問題児たちと向き合う漫画原作。", volumes: 25, chapters: 200 },
  { slug: "evangelion-manga", title: "新世紀エヴァンゲリオン", description: "貞本義行によるアニメ版を漫画化した作品。碇シンジの物語をオリジナル展開で描く。", volumes: 14, chapters: 97 },
  { slug: "chihayafuru", title: "ちはやふる", description: "末次由紀による競技かるた漫画。天才かるた少女・千早の夢と恋を描く青春大作。", volumes: 50, chapters: 246 },
  { slug: "beck-manga", title: "BECK", description: "ハロルド作石による音楽漫画。平凡な少年・田中幸雄がロックバンドで世界を目指す。", volumes: 34, chapters: 148 },
];

// ── 各年代の名作ドラマ（完結・未登録分）─────────────────────
const NEW_DRAMA: WorkAdd[] = [
  // 1990年代
  { slug: "beach-boys-drama", title: "ビーチボーイズ", type: "drama", description: "竹野内豊・反町隆史主演。ペンションを舞台にした夏の青春ラブストーリー。フジ系。", episodeCount: 11 },
  { slug: "101-proposals", title: "101回目のプロポーズ", type: "drama", description: "武田鉄矢・浅野温子主演。「僕は死にましぇん！」が名台詞のラブストーリー。フジ系。", episodeCount: 11 },
  { slug: "hitotsu-yane", title: "ひとつ屋根の下", type: "drama", description: "江口洋介主演。6人きょうだいの絆を描いた感動の家族ドラマ。フジ系。", episodeCount: 12 },
  { slug: "queen-no-kyoshitsu", title: "女王の教室", type: "drama", description: "天海祐希主演。鬼教師が小学生に本物の教育を施す衝撃の問題作。NTV系。", episodeCount: 11 },
  // 2000年代
  { slug: "nodame-cantabile", title: "のだめカンタービレ", type: "drama", platform: "netflix", description: "二ノ宮知子原作。個性的なピアニスト・のだめと指揮者を目指す千秋のラブコメ。フジ系。", episodeCount: 11 },
  { slug: "proposal-daisakusen", title: "プロポーズ大作戦", type: "drama", description: "山下智久・長澤まさみ主演。タイムスリップで人生をやり直す青春ラブドラマ。フジ系。", episodeCount: 11 },
  // 嵐ドラマ
  { slug: "hana-yori-dango-2", title: "花より男子2 リターンズ", type: "drama", platform: "netflix", description: "松本潤・井上真央主演。道明寺とつくしの愛の試練を描くシーズン2。TBS系。", episodeCount: 11 },
  { slug: "maou-drama", title: "魔王", type: "drama", description: "大野智・小栗旬主演。復讐に生きる弁護士と刑事の対決を描くサスペンスドラマ。TBS系。", episodeCount: 11 },
  { slug: "locked-room-drama", title: "鍵のかかった部屋", type: "drama", platform: "amazon_prime", description: "大野智主演。密室の謎を解く防犯コンサルタントと弁護士コンビのミステリドラマ。フジ系。", episodeCount: 10 },
  { slug: "nobunaga-concerto", title: "信長協奏曲", type: "drama", description: "相葉雅紀主演。現代の高校生が戦国時代にタイムスリップし織田信長として生きる物語。フジ系。", episodeCount: 11 },
  { slug: "napoleon-village", title: "ナポレオンの村", type: "drama", description: "相葉雅紀主演。過疎の村に赴任した役人が村おこしに奮闘する感動ドラマ。TBS系。", episodeCount: 5 },
  { slug: "999-s2", title: "99.9刑事専門弁護士 SEASON II", type: "drama", platform: "netflix", description: "松本潤主演。刑事裁判無罪率0.1%に挑む弁護士の続編。深山×斑目の新コンビ。TBS系。", episodeCount: 10 },
  // 2010年代後半〜2020年代
  { slug: "confidence-man-jp", title: "コンフィデンスマンJP", type: "drama", platform: "amazon_prime", description: "長澤まさみ主演。自信満々の詐欺師トリオが巨悪に挑む痛快コメディドラマ。フジ系。", episodeCount: 10 },
  { slug: "elpis-drama", title: "エルピス", type: "drama", platform: "amazon_prime", description: "長澤まさみ・眞栄田郷敦主演。テレビ局で封印された冤罪事件に迫る社会派ドラマ。フジ系。", episodeCount: 10 },
];

async function run() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL が設定されていません");
  const db = createDb(url);

  let addedWorks = 0;
  let skippedWorks = 0;

  console.log("── 完結済み漫画を追加中 ──");
  for (const m of NEW_MANGA) {
    const [existing] = await db.select({ id: works.id }).from(works).where(eq(works.slug, m.slug)).limit(1);
    if (existing) { console.log(`スキップ（重複）: ${m.title}`); skippedWorks++; continue; }

    const [w] = await db.insert(works).values({ slug: m.slug, title: m.title, type: "manga", description: m.description }).returning();

    const volRows = Array.from({ length: m.volumes }, (_, i) => ({
      workId: w.id, episodeNumber: null as number | null, volumeNumber: i + 1,
    }));
    for (let i = 0; i < volRows.length; i += 500) await db.insert(episodes).values(volRows.slice(i, i + 500));

    if (m.chapters && m.chapters > 0) {
      const chapRows = Array.from({ length: m.chapters }, (_, i) => ({
        workId: w.id, episodeNumber: i + 1, volumeNumber: null as number | null,
      }));
      for (let i = 0; i < chapRows.length; i += 500) await db.insert(episodes).values(chapRows.slice(i, i + 500));
    }

    console.log(`✓ ${m.title}（${m.volumes}巻${m.chapters ? ` / ${m.chapters}話` : ""}）`);
    addedWorks++;
  }

  console.log("\n── 名作ドラマ・嵐ドラマを追加中 ──");
  for (const d of NEW_DRAMA) {
    const [existing] = await db.select({ id: works.id }).from(works).where(eq(works.slug, d.slug)).limit(1);
    if (existing) { console.log(`スキップ（重複）: ${d.title}`); skippedWorks++; continue; }

    const [w] = await db.insert(works).values({
      slug: d.slug, title: d.title, type: d.type, platform: d.platform, description: d.description,
    }).returning();

    const epRows = Array.from({ length: d.episodeCount }, (_, i) => ({ workId: w.id, episodeNumber: i + 1 }));
    for (let i = 0; i < epRows.length; i += 500) await db.insert(episodes).values(epRows.slice(i, i + 500));

    console.log(`✓ ${d.title}（${d.episodeCount}話）`);
    addedWorks++;
  }

  console.log(`\n完了: 追加 ${addedWorks}件 / スキップ ${skippedWorks}件`);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
