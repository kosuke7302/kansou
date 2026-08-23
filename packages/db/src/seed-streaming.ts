/**
 * 各配信サービスの独自コンテンツ・独占配信作品を追加するスクリプト
 * 重複スラグはスキップされる
 */
import { createDb } from "./index";
import { works, episodes } from "./schema";
import { eq } from "drizzle-orm";

type WorkAdd = {
  slug: string;
  title: string;
  type: "anime" | "drama" | "movie";
  platform: string;
  description: string;
  keywords?: string;
  episodeCount: number;
};

// ── Netflix オリジナル ──────────────────────────────────────────
const NETFLIX: WorkAdd[] = [
  {
    slug: "imawa-no-kuni-alice",
    title: "今際の国のアリス",
    type: "drama", platform: "netflix", episodeCount: 8,
    description: "麻生羽呂原作。謎の渋谷に迷い込んだ若者たちがデスゲームに参加するNetflixオリジナルサスペンス。山﨑賢人主演。",
    keywords: "今際の国のアリス alice in borderland netflix デスゲーム 渋谷",
  },
  {
    slug: "zenra-kantoku",
    title: "全裸監督",
    type: "drama", platform: "netflix", episodeCount: 8,
    description: "村西とおるの半生を描くNetflixオリジナルドラマ。山田孝之主演。AV業界を舞台にした痛快な人間ドラマ。",
    keywords: "全裸監督 村西とおる 山田孝之 netflix",
  },
  {
    slug: "first-love-hatsukoi",
    title: "First Love 初恋",
    type: "drama", platform: "netflix", episodeCount: 9,
    description: "宇多田ヒカルの楽曲に着想を得たNetflixオリジナルラブドラマ。佐藤健・満島ひかり主演。",
    keywords: "初恋 first love 佐藤健 満島ひかり 宇多田ヒカル netflix",
  },
  {
    slug: "sanctuary-netflix",
    title: "サンクチュアリ -聖域-",
    type: "drama", platform: "netflix", episodeCount: 8,
    description: "Netflixオリジナル相撲ドラマ。元ヤンキーが相撲界に飛び込み横綱を目指す痛快な物語。一ノ瀬ワタル主演。",
    keywords: "サンクチュアリ 聖域 相撲 netflix sanctuary",
  },
  {
    slug: "house-of-ninjas",
    title: "忍びの家 House of Ninjas",
    type: "drama", platform: "netflix", episodeCount: 8,
    description: "現代の忍者一家が国家の危機に立ち向かうNetflixオリジナルアクションドラマ。賀来賢人・吉岡里帆主演。2024年作品。",
    keywords: "忍びの家 house of ninjas 忍者 賀来賢人 netflix 2024",
  },
  {
    slug: "chikyugai-shonen-shojo",
    title: "地球外少年少女",
    type: "anime", platform: "netflix", episodeCount: 6,
    description: "磯光雄監督によるNetflixオリジナルアニメ。2045年の宇宙ステーションで孤立した子供たちがAIと向き合う物語。",
    keywords: "地球外少年少女 磯光雄 netflix SF アニメ",
  },
  {
    slug: "cyberpunk-edgerunners",
    title: "サイバーパンク エッジランナーズ",
    type: "anime", platform: "netflix", episodeCount: 10,
    description: "ゲーム「Cyberpunk 2077」を原作にしたNetflixアニメ。Studio TRIGGER制作。デイヴィッドが傭兵として生きるダークな物語。",
    keywords: "サイバーパンク エッジランナーズ cyberpunk edgerunners TRIGGER netflix アニメ",
  },
  {
    slug: "maiko-makanai",
    title: "舞妓さんちのまかないさん",
    type: "drama", platform: "netflix", episodeCount: 8,
    description: "是枝裕和監督×Netflixオリジナル。京都の置き屋を舞台にした少女たちの成長と友情。永野芽郁・出口夏希主演。",
    keywords: "舞妓さんちのまかないさん 是枝裕和 永野芽郁 netflix 京都 舞妓",
  },
];

// ── Amazon Prime Video 独占アニメ ────────────────────────────────
const AMAZON: WorkAdd[] = [
  {
    slug: "paripi-koumei",
    title: "パリピ孔明",
    type: "anime", platform: "amazon_prime", episodeCount: 12,
    description: "四葉夕ト原作。三国志の軍師・諸葛孔明が現代渋谷に転生しアーティストのマネージャーになるコメディアニメ。Amazon Prime独占。",
    keywords: "パリピ孔明 諸葛孔明 amazon prime アニメ 渋谷 転生",
  },
  {
    slug: "vinland-saga-s1",
    title: "ヴィンランド・サガ",
    type: "anime", platform: "amazon_prime", episodeCount: 24,
    description: "幸村誠原作。ヴァイキング時代を舞台に復讐と贖罪を描く歴史叙事詩アニメ。WIT STUDIO制作。Amazon Prime独占配信。",
    keywords: "ヴィンランド・サガ vinland saga 幸村誠 amazon prime ヴァイキング",
  },
  {
    slug: "undead-girl-murder-farce",
    title: "Undead Girl Murder Farce",
    type: "anime", platform: "amazon_prime", episodeCount: 13,
    description: "岸本和葉原作。不死の少女と探偵が欧州で異形の謎に挑むミステリーアニメ。Amazon Prime独占配信。2023年作品。",
    keywords: "Undead Girl Murder Farce アンデッドガール amazon prime ミステリー アニメ",
  },
  {
    slug: "flcl-alternative",
    title: "FLCL オルタナティブ",
    type: "anime", platform: "amazon_prime", episodeCount: 6,
    description: "Production I.G制作のFLCL続編シリーズ。女子高生4人組と不思議な出来事を描く。Amazon Prime独占配信。",
    keywords: "FLCL オルタナティブ alternative amazon prime アニメ",
  },
];

// ── Disney+ オリジナル ────────────────────────────────────────────
const DISNEY: WorkAdd[] = [
  {
    slug: "shogun-2024",
    title: "SHOGUN 将軍",
    type: "drama", platform: "disney_plus", episodeCount: 10,
    description: "ジェームズ・クラベル原作。戦国時代の日本に漂着したイギリス人航海士と大名の物語。真田広之主演・制作。2024年エミー賞席巻作。",
    keywords: "SHOGUN 将軍 真田広之 disney+ 戦国 エミー賞 2024",
  },
  {
    slug: "the-mandalorian-s1",
    title: "マンダロリアン シーズン1",
    type: "drama", platform: "disney_plus", episodeCount: 8,
    description: "スター・ウォーズ初の実写TVシリーズ。賞金稼ぎの戦士マンドーとグローグーの旅を描くDisney+オリジナル。",
    keywords: "マンダロリアン mandalorian スターウォーズ star wars disney+ グローグー ベビーヨーダ",
  },
  {
    slug: "wandavision",
    title: "ワンダヴィジョン",
    type: "drama", platform: "disney_plus", episodeCount: 9,
    description: "マーベル初のDisney+ドラマ。ヴィジョンとワンダが完璧な郊外生活を生きる謎に包まれたシットコム風の物語。",
    keywords: "ワンダヴィジョン wandavision マーベル marvel disney+ MCU",
  },
  {
    slug: "loki-s1",
    title: "ロキ シーズン1",
    type: "drama", platform: "disney_plus", episodeCount: 6,
    description: "マーベル×Disney+。神話の悪戯者ロキが時間犯罪捜査機関TVAに捕まり、タイムラインを巡る冒険に巻き込まれる。",
    keywords: "ロキ loki マーベル marvel disney+ MCU トム・ヒドルストン",
  },
  {
    slug: "andor-s1",
    title: "アンドー シーズン1",
    type: "drama", platform: "disney_plus", episodeCount: 12,
    description: "スター・ウォーズのスピンオフ。反乱軍のスパイとなるカシアン・アンドーの若き日の物語。政治的なリアルな描写が高評価。",
    keywords: "アンドー andor スターウォーズ star wars disney+ カシアン",
  },
];

// ── Hulu Japan オリジナル・独占 ────────────────────────────────────
const HULU: WorkAdd[] = [
  {
    slug: "silent-drama",
    title: "silent",
    type: "drama", platform: "hulu", episodeCount: 11,
    description: "川口春奈・目黒蓮主演。音を失った初恋の人と再会する純愛ラブストーリー。Hulu×フジテレビ。2022年秋ドラマ。",
    keywords: "silent サイレント 川口春奈 目黒蓮 Snow Man hulu フジテレビ 2022",
  },
  {
    slug: "kotaki-kyodai",
    title: "コタキ兄弟と四苦八苦",
    type: "drama", platform: "hulu", episodeCount: 11,
    description: "山田孝之・滝藤賢一主演のHuluオリジナルドラマ。レンタル彼氏をする兄弟の不思議な日常コメディ。",
    keywords: "コタキ兄弟 四苦八苦 山田孝之 滝藤賢一 hulu オリジナル",
  },
  {
    slug: "tada-rikon",
    title: "ただ離婚してないだけ",
    type: "drama", platform: "hulu", episodeCount: 12,
    description: "内山昂輝原作のHulu×フジテレビドラマ。表面上は普通の夫婦が歪んだ関係の真実に迫るサスペンス。",
    keywords: "ただ離婚してないだけ 離婚 hulu フジテレビ サスペンス",
  },
  {
    slug: "yugure-te-wo-tsunagu",
    title: "夕暮れに、手をつなぐ",
    type: "drama", platform: "hulu", episodeCount: 11,
    description: "永瀬廉・奈緒主演のHulu×フジテレビドラマ。夢を追う男女の恋愛と葛藤を描くラブドラマ。2023年作品。",
    keywords: "夕暮れに手をつなぐ 永瀬廉 奈緒 King & Prince hulu フジテレビ",
  },
];

// ── U-NEXT ────────────────────────────────────────────────────────
const UNEXT: WorkAdd[] = [
  {
    slug: "liar-game-revival",
    title: "ライアーゲーム THE REVIVAL",
    type: "drama", platform: "u_next", episodeCount: 8,
    description: "甲斐谷忍原作の人気心理ゲームドラマの新シリーズ。U-NEXTオリジナルとして復活。2023年作品。",
    keywords: "ライアーゲーム liar game THE REVIVAL u-next オリジナル",
  },
  {
    slug: "spy-family-anime",
    title: "SPY×FAMILY",
    type: "anime", platform: "u_next", episodeCount: 25,
    description: "遠藤達哉原作。スパイの父・殺し屋の母・超能力者の娘が家族を演じる笑えるスパイコメディ。U-NEXTで配信中。",
    keywords: "SPY×FAMILY スパイファミリー 遠藤達哉 アーニャ ロイド ヨル u-next アニメ",
  },
  {
    slug: "ossan-love-film",
    title: "おっさんずラブ in the sky",
    type: "drama", platform: "u_next", episodeCount: 8,
    description: "田中圭主演の大ヒットBLドラマの続編。舞台を空の旅へと移した恋愛コメディドラマ。U-NEXTで配信。",
    keywords: "おっさんずラブ in the sky 田中圭 BL ドラマ u-next",
  },
];

// ── dアニメストア ─────────────────────────────────────────────────
const D_ANIME: WorkAdd[] = [
  {
    slug: "madoka-magica",
    title: "魔法少女まどか☆マギカ",
    type: "anime", platform: "d_anime", episodeCount: 12,
    description: "新房昭之監督×虚淵玄脚本の衝撃的な魔法少女アニメ。dアニメストアで全話配信中。",
    keywords: "まどかマギカ 魔法少女まどか マギカ Madoka Magica 虚淵玄 d_anime dアニメ アニメ",
  },
  {
    slug: "steins-gate-anime",
    title: "シュタインズ・ゲート",
    type: "anime", platform: "d_anime", episodeCount: 24,
    description: "5pb.×Nitroplusのゲーム原作アニメ。天才自称科学者・岡部倫太郎がタイムリープの謎に挑む。dアニメストアで配信。",
    keywords: "シュタインズ・ゲート steins;gate シュタゲ 岡部 タイムリープ d_anime dアニメ",
  },
  {
    slug: "rezero-s1",
    title: "Re:ゼロから始める異世界生活",
    type: "anime", platform: "d_anime", episodeCount: 25,
    description: "長月達平原作の異世界転生アニメ。死に戻りの能力を持つ主人公スバルの苦難と成長を描く。dアニメストアで配信。",
    keywords: "リゼロ Re:ゼロ 異世界生活 スバル レム エミリア d_anime dアニメ アニメ",
  },
];

// ── ABEMA ──────────────────────────────────────────────────────────
const ABEMA: WorkAdd[] = [
  {
    slug: "oshi-ga-budoukan",
    title: "推しが武道館いってくれたら死ぬ",
    type: "anime", platform: "abema", episodeCount: 12,
    description: "平尾アウリ原作。地下アイドルに狂うファンの純愛を描くアイドルラブコメアニメ。ABEMA独占配信。",
    keywords: "推し武道 推しが武道館 アイドル ファン ABEMA アニメ",
  },
  {
    slug: "karakai-jouzu-takagi",
    title: "からかい上手の高木さん",
    type: "anime", platform: "abema", episodeCount: 12,
    description: "山本崇一朗原作。隣の席の高木さんにからかわれ続ける西片の純朴な恋愛アニメ。ABEMAで配信中。",
    keywords: "高木さん からかい上手の高木さん 西片 ABEMA アニメ 恋愛",
  },
];

// ── Lemino ────────────────────────────────────────────────────────
const LEMINO: WorkAdd[] = [
  {
    slug: "tokyo-er-drama",
    title: "TOKYO ER 東京救命室",
    type: "drama", platform: "lemino", episodeCount: 9,
    description: "救命救急を舞台にしたLeminoオリジナル医療ドラマ。高橋文哉・奈緒主演。2024年作品。",
    keywords: "TOKYO ER 東京救命室 Lemino 医療 ドラマ 2024",
  },
];

// ── FOD Premium ───────────────────────────────────────────────────
const FOD: WorkAdd[] = [
  {
    slug: "fumo-fumo-chan",
    title: "フモフモさん",
    type: "anime", platform: "fod", episodeCount: 20,
    description: "ぬいぐるみのフモフモさんが日常の謎を解くFODオリジナルショートアニメ。",
    keywords: "フモフモさん FOD オリジナル アニメ",
  },
];

async function run() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL が設定されていません");
  const db = createDb(url);

  const allWorks: { group: string; list: WorkAdd[] }[] = [
    { group: "Netflix オリジナル", list: NETFLIX },
    { group: "Amazon Prime Video 独占", list: AMAZON },
    { group: "Disney+ オリジナル", list: DISNEY },
    { group: "Hulu Japan", list: HULU },
    { group: "U-NEXT", list: UNEXT },
    { group: "dアニメストア", list: D_ANIME },
    { group: "ABEMA", list: ABEMA },
    { group: "Lemino", list: LEMINO },
    { group: "FOD Premium", list: FOD },
  ];

  let added = 0, skipped = 0;

  for (const { group, list } of allWorks) {
    console.log(`\n── ${group} ──`);
    for (const w of list) {
      const [existing] = await db.select({ id: works.id }).from(works).where(eq(works.slug, w.slug)).limit(1);
      if (existing) { console.log(`  スキップ（重複）: ${w.title}`); skipped++; continue; }

      const [work] = await db
        .insert(works)
        .values({ slug: w.slug, title: w.title, type: w.type, platform: w.platform, description: w.description, keywords: w.keywords ?? null })
        .returning();

      const rows = Array.from({ length: w.episodeCount }, (_, i) => ({ workId: work.id, episodeNumber: i + 1 }));
      for (let i = 0; i < rows.length; i += 500) await db.insert(episodes).values(rows.slice(i, i + 500));

      console.log(`  ✓ ${w.title}（${w.episodeCount}話 / ${w.platform}）`);
      added++;
    }
  }

  console.log(`\n完了: 追加 ${added}件 / スキップ ${skipped}件`);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
