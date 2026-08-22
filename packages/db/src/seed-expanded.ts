import { createDb } from "./index";
import { works, episodes } from "./schema";
import { sql } from "drizzle-orm";

type MangaWork = {
  slug: string;
  title: string;
  description: string;
  chapters: number;
  chaptersPerVolume: number;
  chapterTitles?: Record<number, string>;
};

type EpisodeWork = {
  slug: string;
  title: string;
  type: "anime" | "drama" | "movie";
  description: string;
  episodeCount: number;
  episodeTitles?: Record<number, string>;
};

const MANGA: MangaWork[] = [
  { slug: "kochikame", title: "こちら葛飾区亀有公園前派出所", description: "秋本治による40年にわたる国民的ギャグ漫画。下町の警察官・両津勘吉の破天荒な日常。全200巻。", chapters: 1960, chaptersPerVolume: 10, chapterTitles: { 1: "おまわりさんがいっぱい!!" } },
  { slug: "one-piece", title: "ワンピース", description: "尾田栄一郎による海賊冒険漫画。ひとつなぎの大秘宝を求めるルフィの物語。", chapters: 1100, chaptersPerVolume: 10, chapterTitles: { 1: "ロマンス・ドーン", 100: "ビビの冒険", 309: "さよなら", 597: "約束", 1000: "ルフィ VS カイドウ" } },
  { slug: "naruto", title: "NARUTO", description: "岸本斉史による忍者漫画。落ちこぼれ忍者ナルトの成長を描く。", chapters: 700, chaptersPerVolume: 10, chapterTitles: { 1: "うずまきナルト!!", 245: "転身…!!", 700: "ナルトうずまき!!" } },
  { slug: "dragon-ball", title: "ドラゴンボール", description: "鳥山明による冒険漫画。少年悟空の冒険から始まる壮大な物語。", chapters: 519, chaptersPerVolume: 12, chapterTitles: { 1: "ブルマと孫悟空", 194: "さよなら悟空", 519: "おわり" } },
  { slug: "bleach", title: "BLEACH", description: "久保帯人による死神バトル漫画。死神代行・黒崎一護の戦いを描く。", chapters: 686, chaptersPerVolume: 9, chapterTitles: { 1: "死神", 423: "死神代行消失篇", 686: "Death & Strawberry" } },
  { slug: "fairy-tail", title: "フェアリーテイル", description: "真島ヒロによるファンタジー冒険漫画。魔法使いたちのギルドの物語。", chapters: 545, chaptersPerVolume: 9 },
  { slug: "kimetsu-manga", title: "鬼滅の刃", description: "吾峠呼世晴による大正時代を舞台にした鬼殺しの物語。", chapters: 205, chaptersPerVolume: 9, chapterTitles: { 1: "残酷", 204: "幾星霜を煌めく命", 205: "幾星霜を煌めく命 後編" } },
  { slug: "attack-on-titan-manga", title: "進撃の巨人", description: "諫山創による人類と巨人の戦いを描いたダーク・ファンタジー。", chapters: 139, chaptersPerVolume: 4, chapterTitles: { 1: "二千年後の君へ", 130: "人類の夜明け", 138: "長い夢", 139: "あの丘の木に向かって" } },
  { slug: "death-note-manga", title: "デスノート", description: "大場つぐみ・小畑健による心理サスペンス漫画。名前を書くと死ぬノートを巡る頭脳戦。", chapters: 108, chaptersPerVolume: 9, chapterTitles: { 1: "退屈", 58: "隅" } },
  { slug: "hunter-x-hunter-manga", title: "ハンターxハンター", description: "冨樫義博による冒険漫画。ゴンとキルアの友情と冒険を描く。", chapters: 401, chaptersPerVolume: 11, chapterTitles: { 1: "GON・FREECSS", 200: "終幕" } },
  { slug: "my-hero-academia", title: "僕のヒーローアカデミア", description: "堀越耕平によるヒーロー漫画。個性を持たない少年デクの成長を描く。", chapters: 430, chaptersPerVolume: 10, chapterTitles: { 1: "緑谷出久：オリジン", 306: "超常解放戦線、始動" } },
  { slug: "jujutsu-kaisen", title: "呪術廻戦", description: "芥見下々による呪術師たちの戦いを描くダーク・ファンタジー。", chapters: 270, chaptersPerVolume: 10, chapterTitles: { 1: "龍堂一家", 236: "人外魔境新宿決戦⑮" } },
  { slug: "chainsaw-man", title: "チェンソーマン", description: "藤本タツキによる悪魔を倒して生きる少年・デンジの物語。", chapters: 168, chaptersPerVolume: 11, chapterTitles: { 1: "犬とチェンソー", 97: "夢の道具" } },
  { slug: "tokyo-ghoul", title: "東京喰種", description: "石田スイによる人間と食人種・喰種の共存を描いたダーク・ファンタジー。", chapters: 143, chaptersPerVolume: 10 },
  { slug: "golden-kamuy", title: "ゴールデンカムイ", description: "野田サトルによる明治時代北海道を舞台にした金塊争奪サバイバル。", chapters: 314, chaptersPerVolume: 10, chapterTitles: { 1: "不死身の杉元" } },
  { slug: "slam-dunk", title: "スラムダンク", description: "井上雄彦によるバスケットボール漫画。不良少年・桜木花道のバスケへの情熱を描く。", chapters: 276, chaptersPerVolume: 9, chapterTitles: { 1: "新たなる旅立ち", 276: "諦めたらそこで試合終了ですよ…?" } },
  { slug: "vagabond", title: "バガボンド", description: "井上雄彦による宮本武蔵の生涯を描く歴史漫画。", chapters: 327, chaptersPerVolume: 9 },
  { slug: "berserk", title: "ベルセルク", description: "三浦建太郎によるダーク・ファンタジーの金字塔。剣士ガッツの復讐の旅。", chapters: 374, chaptersPerVolume: 9, chapterTitles: { 1: "黒い剣士" } },
  { slug: "rurouni-kenshin", title: "るろうに剣心", description: "和月伸宏による明治時代を舞台にした剣客漫画。", chapters: 255, chaptersPerVolume: 9 },
  { slug: "fullmetal-alchemist", title: "鋼の錬金術師", description: "荒川弘による錬金術師兄弟の旅を描いたファンタジー。", chapters: 108, chaptersPerVolume: 4, chapterTitles: { 1: "鋼の錬金術師", 108: "新しき夜明け" } },
  { slug: "yu-yu-hakusho", title: "幽☆遊☆白書", description: "富樫義博による霊界探偵・浦飯幽助の活躍を描く。", chapters: 175, chaptersPerVolume: 9 },
  { slug: "gintama-manga", title: "銀魂", description: "空知英秋による幕末SF時代劇コメディ。", chapters: 704, chaptersPerVolume: 9, chapterTitles: { 1: "万事屋でいこう!!" } },
  { slug: "detective-conan", title: "名探偵コナン", description: "青山剛昌による長編推理漫画。黒ずくめの組織に子供にされた高校生探偵の物語。", chapters: 1110, chaptersPerVolume: 11 },
  { slug: "doraemon", title: "ドラえもん", description: "藤子・F・不二雄による国民的SF漫画。22世紀から来たネコ型ロボットと少年の冒険。", chapters: 1345, chaptersPerVolume: 30 },
  { slug: "dr-stone", title: "Dr.STONE", description: "稲垣理一郎・Boichiによるサイエンス冒険漫画。石化した世界で文明を再構築する物語。", chapters: 232, chaptersPerVolume: 9 },
  { slug: "black-clover", title: "ブラッククローバー", description: "田畠裕基による魔法騎士団の物語。魔法を持たない少年アスタの夢を描く。", chapters: 374, chaptersPerVolume: 10 },
  { slug: "seven-deadly-sins", title: "七つの大罪", description: "鈴木央による伝説の騎士団・七つの大罪の復活を描くファンタジー。", chapters: 346, chaptersPerVolume: 9 },
  { slug: "food-wars", title: "食戟のソーマ", description: "附田祐斗・佐伯俊による料理をテーマにしたバトル漫画。", chapters: 315, chaptersPerVolume: 9 },
  { slug: "promised-neverland", title: "約束のネバーランド", description: "白井カイウ・出水ぽすかによる孤児院からの脱出を描くサスペンス。", chapters: 181, chaptersPerVolume: 9, chapterTitles: { 1: "121045" } },
  { slug: "tokyo-revengers", title: "東京卍リベンジャーズ", description: "和久井健によるタイムリープ×ヤンキー漫画。", chapters: 278, chaptersPerVolume: 9 },
  { slug: "haikyuu", title: "ハイキュー!!", description: "古舘春一によるバレーボール漫画。小柄な少年・日向翔陽の成長を描く。", chapters: 402, chaptersPerVolume: 9, chapterTitles: { 1: "烏野高校 vs. 青葉城西高校", 402: "チャンピオン" } },
  { slug: "kuroko-no-basket", title: "黒子のバスケ", description: "藤巻忠俊によるバスケットボール漫画。幻の六人目・黒子テツヤの活躍。", chapters: 276, chaptersPerVolume: 9 },
  { slug: "prince-of-tennis", title: "テニスの王子様", description: "許斐剛によるテニス漫画。神童・越前リョーマの活躍を描く。", chapters: 379, chaptersPerVolume: 9 },
  { slug: "captain-tsubasa", title: "キャプテン翼", description: "高橋陽一によるサッカー漫画。世界を目指す大空翼の物語。", chapters: 270, chaptersPerVolume: 7 },
  { slug: "saint-seiya", title: "聖闘士星矢", description: "車田正美による女神アテナに仕える聖闘士たちの戦いを描く。", chapters: 258, chaptersPerVolume: 9 },
  { slug: "city-hunter", title: "シティーハンター", description: "北条司によるスイーパー・冴羽獠の活躍を描くアクション漫画。", chapters: 286, chaptersPerVolume: 8 },
  { slug: "fist-north-star", title: "北斗の拳", description: "武論尊・原哲夫による核戦争後の世界を舞台にした伝説の拳法漫画。", chapters: 245, chaptersPerVolume: 9 },
  { slug: "ranma-half", title: "らんま1/2", description: "高橋留美子によるドタバタラブコメ。水に濡れると女になる男の子の物語。", chapters: 407, chaptersPerVolume: 11 },
  { slug: "urusei-yatsura", title: "うる星やつら", description: "高橋留美子によるSFラブコメの先駆け。鬼娘ラムとあたるの物語。", chapters: 374, chaptersPerVolume: 11 },
  { slug: "inuyasha-manga", title: "犬夜叉", description: "高橋留美子による戦国時代を舞台にしたファンタジー漫画。", chapters: 558, chaptersPerVolume: 10 },
  { slug: "fruits-basket", title: "フルーツバスケット", description: "高屋奈月による十二支の呪いを持つ草摩家の物語。", chapters: 136, chaptersPerVolume: 6 },
  { slug: "a-silent-voice", title: "聲の形", description: "大今良時によるいじめと贖罪をテーマにした感動漫画。", chapters: 62, chaptersPerVolume: 9 },
  { slug: "spy-x-family-manga", title: "SPY×FAMILY", description: "遠藤達哉によるスパイと殺し屋と超能力者の偽家族コメディ。", chapters: 110, chaptersPerVolume: 9 },
  { slug: "kaguya-sama", title: "かぐや様は告らせたい", description: "赤坂アカによる「如何に相手に告白させるか」を巡る心理戦ラブコメ。", chapters: 281, chaptersPerVolume: 10 },
  { slug: "quintessential-quintuplets", title: "五等分の花嫁", description: "春場ねぎによる五つ子の花嫁を探すラブコメ漫画。", chapters: 122, chaptersPerVolume: 9 },
  { slug: "oshi-no-ko-manga", title: "推しの子", description: "赤坂アカ・横槍メンゴによる芸能界の闇を描いたサスペンス漫画。", chapters: 160, chaptersPerVolume: 11 },
  { slug: "delicious-in-dungeon", title: "ダンジョン飯", description: "九井諒子によるダンジョン探索×料理漫画。モンスターを食べながら妹を救う冒険。", chapters: 97, chaptersPerVolume: 7 },
  { slug: "blue-lock", title: "ブルーロック", description: "金城宗幸・ノ村優介によるFWオンリーのサッカー育成バトル。", chapters: 280, chaptersPerVolume: 9 },
  { slug: "dandadan", title: "ダンダダン", description: "龍幸伸によるオカルト×異能力バトル漫画。UFO信者と幽霊信者の物語。", chapters: 170, chaptersPerVolume: 17 },
  { slug: "kaiju-no8", title: "怪獣8号", description: "松本直也による怪獣討伐隊を目指す男の物語。", chapters: 105, chaptersPerVolume: 9 },
  { slug: "jigokuraku", title: "地獄楽", description: "賀来ゆうじによる死刑囚と処刑人が極楽浄土の島を目指すアクション。", chapters: 127, chaptersPerVolume: 10 },
  { slug: "vinland-saga-manga", title: "ヴィンランド・サガ", description: "幸村誠によるヴァイキング時代を舞台にした歴史漫画。", chapters: 220, chaptersPerVolume: 10 },
  { slug: "oyasumi-punpun", title: "おやすみプンプン", description: "浅野いにおによる鳥のような少年・プンプンの成長を描く問題作。", chapters: 147, chaptersPerVolume: 15 },
  { slug: "parasyte", title: "寄生獣", description: "岩明均による人間に寄生した謎の生物との共存を描くSF漫画。", chapters: 64, chaptersPerVolume: 6 },
  { slug: "yotsuba", title: "よつばと！", description: "あずまきよひこによる5歳の女の子ヨツバの日常を描くほのぼの漫画。", chapters: 111, chaptersPerVolume: 7 },
  { slug: "takagi-san", title: "からかい上手の高木さん", description: "山本崇一朗による隣の席の女子にからかわれる男子の日常ラブコメ。", chapters: 181, chaptersPerVolume: 9 },
  { slug: "noragami", title: "ノラガミ", description: "あだちとおかによる失業中の神・ヤトの物語。", chapters: 106, chaptersPerVolume: 4 },
  { slug: "toilet-hanako", title: "地縛少年花子くん", description: "あいだいろによる学校の七不思議・花子くんとの日常を描くファンタジー。", chapters: 109, chaptersPerVolume: 6 },
  { slug: "black-jack", title: "ブラック・ジャック", description: "手塚治虫による無免許外科医ブラック・ジャックの活躍を描く医療漫画。", chapters: 243, chaptersPerVolume: 14 },
  { slug: "astro-boy", title: "鉄腕アトム", description: "手塚治虫による科学の力で生まれたロボット少年の物語。", chapters: 115, chaptersPerVolume: 5 },
  { slug: "ao-no-hako", title: "アオのハコ", description: "三浦糀によるバドミントン×バスケの青春ラブコメ。", chapters: 130, chaptersPerVolume: 9 },
  { slug: "mashle", title: "マッシュル", description: "甲本一による魔法のない少年マッシュルの魔法学校サバイバル。", chapters: 162, chaptersPerVolume: 10 },
  { slug: "blade-immortal", title: "無限の住人", description: "沙村広明による江戸時代を舞台にした不死の剣客漫画。", chapters: 207, chaptersPerVolume: 7 },
  { slug: "world-trigger", title: "ワールドトリガー", description: "葦原大介による近界民と戦うボーダー隊員の物語。", chapters: 240, chaptersPerVolume: 10 },
  { slug: "ao-exorcist", title: "青の祓魔師", description: "加藤和恵による悪魔の息子が祓魔師を目指すファンタジー。", chapters: 135, chaptersPerVolume: 7 },
  { slug: "cardcaptor-sakura", title: "カードキャプターさくら", description: "CLAMPによる魔法の力でカードを集める少女の物語。", chapters: 50, chaptersPerVolume: 6 },
  { slug: "sailor-moon", title: "美少女戦士セーラームーン", description: "武内直子による月野うさぎが変身して戦う少女漫画の金字塔。", chapters: 60, chaptersPerVolume: 6 },
  { slug: "dragon-quest-dai", title: "ドラゴンクエスト ダイの大冒険", description: "三条陸・稲田浩司によるドラゴンクエスト世界の少年勇者ダイの冒険。", chapters: 347, chaptersPerVolume: 15 },
  { slug: "magi", title: "マギ", description: "大高忍による千夜一夜物語をベースにしたファンタジー漫画。", chapters: 369, chaptersPerVolume: 12 },
  { slug: "skip-beat", title: "スキップ・ビート！", description: "仲村佳樹による復讐のために芸能界に入った少女の物語。", chapters: 300, chaptersPerVolume: 13 },
  { slug: "nana", title: "NANA", description: "矢沢あいによる同じ名前の二人のナナの友情と恋愛を描く物語。", chapters: 84, chaptersPerVolume: 6 },
  { slug: "boys-over-flowers", title: "花より男子", description: "神尾葉子による平凡な少女と花の4人組の恋愛漫画。", chapters: 240, chaptersPerVolume: 13 },
  { slug: "re-zero-manga", title: "Re:ゼロから始める異世界生活", description: "長月達平原作の異世界転移×死に戻り漫画版。", chapters: 90, chaptersPerVolume: 9 },
  { slug: "shield-hero-manga", title: "盾の勇者の成り上がり", description: "アネコユサギ原作の異世界に召喚された盾の勇者の物語漫画版。", chapters: 95, chaptersPerVolume: 9 },
  { slug: "made-in-abyss-manga", title: "メイドインアビス", description: "つくしあきひとによる深淵なる奈落の謎を探る少女と少年の物語。", chapters: 72, chaptersPerVolume: 9 },
  { slug: "goblin-slayer-manga", title: "ゴブリンスレイヤー", description: "蝸牛くも原作のゴブリン退治専門の冒険者の物語漫画版。", chapters: 75, chaptersPerVolume: 9 },
  { slug: "dungeon-meshi-alt", title: "ダンジョン飯 ふしぎ料理", description: "九井諒子によるダンジョン飯のスピンオフ短編集。", chapters: 24, chaptersPerVolume: 8 },
  { slug: "komi-san", title: "古見さんは、コミュ症です。", description: "oda tomohitoによるコミュ障美少女・古見さんの友達100人作り漫画。", chapters: 479, chaptersPerVolume: 16 },
  { slug: "rent-a-girlfriend", title: "彼女、お借りします", description: "宮島礼吏によるレンタル彼女をめぐるラブコメ漫画。", chapters: 340, chaptersPerVolume: 10 },
  { slug: "tonikaku-kawaii", title: "トニカクカワイイ", description: "畑健二郎による一目惚れで結婚した二人の夫婦ラブコメ。", chapters: 240, chaptersPerVolume: 10 },
  { slug: "kakegurui", title: "賭ケグルイ", description: "河本ほむら・尚村透による賭け事に命をかける女学院の物語。", chapters: 110, chaptersPerVolume: 9 },
  { slug: "classroom-elite", title: "ようこそ実力至上主義の教室へ", description: "衣笠彰梧原作の能力主義学校を舞台にした頭脳戦漫画版。", chapters: 80, chaptersPerVolume: 9 },
  { slug: "domestic-girlfriend", title: "ドメスティックな彼女", description: "流石景による複雑な家庭環境と恋愛を描いた漫画。", chapters: 276, chaptersPerVolume: 10 },
  { slug: "yamada-kun", title: "山田くんと7人の魔女", description: "吉河美芸による接触で魔女の能力を発動できる男子の物語。", chapters: 243, chaptersPerVolume: 9 },
  { slug: "nisekoi", title: "ニセコイ", description: "古味直志によるヤクザの息子と女親分の娘の偽恋人ラブコメ。", chapters: 229, chaptersPerVolume: 9 },
  { slug: "we-never-learn", title: "ぼくたちは勉強ができない", description: "筒井大志によるスーパー優等生たちを教える家庭教師のラブコメ。", chapters: 185, chaptersPerVolume: 9 },
  { slug: "the-rising-of-shield-hero-manga", title: "盾の勇者の成り上がり 〜ガラス〜", description: "異世界召喚された盾の勇者の物語のサイドストーリー。", chapters: 45, chaptersPerVolume: 9 },
  { slug: "eva-manga", title: "新世紀エヴァンゲリオン", description: "貞本義行によるTVアニメの公式漫画版。", chapters: 87, chaptersPerVolume: 6 },
  { slug: "phoenix", title: "火の鳥", description: "手塚治虫による生命と文明をテーマにした壮大なSF漫画。", chapters: 107, chaptersPerVolume: 9 },
  { slug: "kinnikuman", title: "キン肉マン", description: "ゆでたまごによる超人レスリングを描いた伝説のスポーツギャグ漫画。", chapters: 860, chaptersPerVolume: 13 },
  { slug: "nichijou", title: "日常", description: "あらゐけいいちによる日常の中のシュールなギャグ漫画。", chapters: 186, chaptersPerVolume: 19 },
  { slug: "laid-back-camp-manga", title: "ゆるキャン△", description: "あfろによる女子高生たちのゆるいキャンプ日常漫画。", chapters: 90, chaptersPerVolume: 6 },
  { slug: "bloom-into-you", title: "やがて君になる", description: "仲谷鳰による百合恋愛漫画の傑作。", chapters: 45, chaptersPerVolume: 6 },
  { slug: "komi-san-alt", title: "古見さんのモノローグ", description: "古見さんのスピンオフ短編。", chapters: 30, chaptersPerVolume: 6 },
  { slug: "kageki-shojo", title: "歌劇の花", description: "小山愛子による宝塚をモチーフにした舞台女優の物語。", chapters: 70, chaptersPerVolume: 7 },
  { slug: "solanin", title: "ソラニン", description: "浅野いにおによる20代の若者たちのリアルな青春と喪失の物語。", chapters: 21, chaptersPerVolume: 11 },
];

const ANIME: EpisodeWork[] = [
  { slug: "evangelion", title: "新世紀エヴァンゲリオン", type: "anime", description: "庵野秀明監督。少年少女が巨大人型兵器で戦うSFアニメ。", episodeCount: 26, episodeTitles: { 1: "使徒、襲来", 24: "最後のシ者", 25: "終わる世界", 26: "世界の中心でアイを叫んだけもの" } },
  { slug: "attack-on-titan", title: "進撃の巨人", type: "anime", description: "諫山創原作。人類と巨人の戦いを描くダーク・ファンタジーアニメ。", episodeCount: 87, episodeTitles: { 1: "二千年後の君へ", 59: "地鳴らし" } },
  { slug: "kimetsu", title: "鬼滅の刃", type: "anime", description: "吾峠呼世晴原作。大正時代の鬼殺しアニメ。ufotable制作。", episodeCount: 26, episodeTitles: { 19: "ヒノカミ", 26: "新たな任務" } },
  { slug: "fma-brotherhood", title: "鋼の錬金術師 BROTHERHOOD", type: "anime", description: "荒川弘原作の完全版アニメ化。錬金術師兄弟の旅を描く。", episodeCount: 64, episodeTitles: { 1: "鋼の錬金術師", 64: "旅の終わりへ" } },
  { slug: "cowboy-bebop", title: "カウボーイビバップ", type: "anime", description: "渡辺信一郎監督。宇宙を舞台にした賞金稼ぎたちの物語。", episodeCount: 26, episodeTitles: { 1: "アステロイド・ブルース", 26: "ザ・リアル・フォーク・ブルース 後編" } },
  { slug: "steins-gate", title: "シュタインズ・ゲート", type: "anime", description: "5pb.原作のタイムトラベルSFアニメ。白衣の未来ガジェット研究所の物語。", episodeCount: 24, episodeTitles: { 1: "始まりと終わりのプロローグ", 22: "存在証明のアポトーシス" } },
  { slug: "your-lie-in-april", title: "四月は君の嘘", type: "anime", description: "新川直司原作。ピアノを弾けなくなった少年とヴァイオリニストの少女の物語。", episodeCount: 22, episodeTitles: { 22: "春風" } },
  { slug: "clannad-after-story", title: "CLANNAD AFTER STORY", type: "anime", description: "KEY原作。高校卒業後の岡崎朋也の人生を描いた感動作。", episodeCount: 24, episodeTitles: { 18: "空白の時間" } },
  { slug: "anohana", title: "あの日見た花の名前を僕達はまだ知らない", type: "anime", description: "岡田麿里脚本。幼なじみの霊が現れた夏の感動アニメ。", episodeCount: 11 },
  { slug: "violet-evergarden", title: "ヴァイオレット・エヴァーガーデン", type: "anime", description: "暁佳奈原作。元兵器少女が手紙を書く代書屋で成長する物語。", episodeCount: 13, episodeTitles: { 10: "あの子に、ヴァイオレット・エヴァーガーデンを" } },
  { slug: "re-zero", title: "Re:ゼロから始める異世界生活", type: "anime", description: "長月達平原作。死に戻りの能力で異世界を生き抜く物語。", episodeCount: 25, episodeTitles: { 15: "ゼロから" } },
  { slug: "pluto-anime", title: "PLUTO", type: "anime", description: "浦沢直樹原作。手塚治虫「鉄腕アトム」を原案にしたNetflixアニメ。ロボット刑事ゲジヒトの捜査を描く。", episodeCount: 8 },
  { slug: "madoka-magica", title: "魔法少女まどか☆マギカ", type: "anime", description: "虚淵玄脚本。魔法少女の真実を描いたダーク・ファンタジーアニメ。", episodeCount: 12, episodeTitles: { 3: "もう何も恐くない", 10: "もう誰にも頼らない", 12: "わたしの、最高の友達" } },
  { slug: "gurren-lagann", title: "天元突破グレンラガン", type: "anime", description: "今石洋之監督。穴の中から始まる少年たちの宇宙規模の冒険。", episodeCount: 27, episodeTitles: { 27: "天の光はすべて星" } },
  { slug: "code-geass", title: "コードギアス 反逆のルルーシュ", type: "anime", description: "谷口悟朗監督。ギアスの力で世界に反逆する皇子の物語。", episodeCount: 50, episodeTitles: { 25: "零のレクイエム" } },
  { slug: "one-punch-man", title: "ワンパンマン", type: "anime", description: "ONE原作。一撃で全てを倒せるヒーローの日常を描くギャグアクション。", episodeCount: 12 },
  { slug: "mob-psycho-100", title: "モブサイコ100", type: "anime", description: "ONE原作。強力な超能力を持つ少年・茂の成長を描く。", episodeCount: 12 },
  { slug: "demon-slayer-s2", title: "鬼滅の刃 遊郭編", type: "anime", description: "遊郭を舞台にした鬼滅の刃第2期。音柱・宇随天元との共闘。", episodeCount: 11 },
  { slug: "jujutsu-kaisen-anime", title: "呪術廻戦", type: "anime", description: "芥見下々原作。呪術高専を舞台にした呪術師たちのバトルアニメ。", episodeCount: 24, episodeTitles: { 1: "龍堂一家" } },
  { slug: "chainsaw-man-anime", title: "チェンソーマン", type: "anime", description: "藤本タツキ原作。悪魔狩りの少年デンジのバトルアニメ。", episodeCount: 12 },
  { slug: "spy-x-family-anime", title: "SPY×FAMILY", type: "anime", description: "遠藤達哉原作。偽家族のハートフルコメディアニメ。", episodeCount: 25 },
  { slug: "oshi-no-ko-anime", title: "推しの子", type: "anime", description: "赤坂アカ原作。芸能界の闇を描くサスペンスアニメ。", episodeCount: 11 },
  { slug: "blue-lock-anime", title: "ブルーロック", type: "anime", description: "金城宗幸原作。ストライカー養成プロジェクトのサッカーバトルアニメ。", episodeCount: 24 },
  { slug: "dandadan-anime", title: "ダンダダン", type: "anime", description: "龍幸伸原作。オカルト×バトルアニメ。Science SARUアニメーション。", episodeCount: 12 },
  { slug: "fullmetal-alchemist-2003", title: "鋼の錬金術師(2003年版)", type: "anime", description: "荒川弘原作の2003年アニメ版。独自のルートで展開する。", episodeCount: 51 },
  { slug: "dragon-ball-z", title: "ドラゴンボールZ", type: "anime", description: "鳥山明原作。悟空の息子・悟飯が活躍する続編シリーズ。", episodeCount: 291 },
  { slug: "dragon-ball-super", title: "ドラゴンボール超", type: "anime", description: "鳥山明原作の最新シリーズ。神と戦う悟空たちを描く。", episodeCount: 131 },
  { slug: "naruto-anime", title: "NARUTO -ナルト-", type: "anime", description: "岸本斉史原作。落ちこぼれ忍者ナルトの成長アニメ。", episodeCount: 220 },
  { slug: "naruto-shippuden", title: "NARUTO 疾風伝", type: "anime", description: "ナルト2年半後の続編。暁との決戦を描く。", episodeCount: 500 },
  { slug: "bleach-anime", title: "BLEACH", type: "anime", description: "久保帯人原作の死神バトルアニメ。一護と仲間たちの戦い。", episodeCount: 366 },
  { slug: "fairy-tail-anime", title: "フェアリーテイル", type: "anime", description: "真島ヒロ原作のギルドファンタジーアニメ。", episodeCount: 328 },
  { slug: "one-piece-anime", title: "ワンピース", type: "anime", description: "尾田栄一郎原作。海賊ルフィの冒険を描く国民的アニメ。", episodeCount: 1000 },
  { slug: "my-hero-academia-anime", title: "僕のヒーローアカデミア", type: "anime", description: "堀越耕平原作のヒーローバトルアニメ。", episodeCount: 113 },
  { slug: "black-clover-anime", title: "ブラッククローバー", type: "anime", description: "田畠裕基原作。魔法のない少年アスタのバトルアニメ。", episodeCount: 170 },
  { slug: "haikyuu-anime", title: "ハイキュー!!", type: "anime", description: "古舘春一原作のバレーボールアニメ。", episodeCount: 85 },
  { slug: "toradora", title: "とらドラ!", type: "anime", description: "竹宮ゆゆこ原作。凶暴な小さな女の子・大河と高須のラブコメアニメ。", episodeCount: 25, episodeTitles: { 25: "虎と龍" } },
  { slug: "haruhi", title: "涼宮ハルヒの憂鬱", type: "anime", description: "谷川流原作。SOS団の非日常的な日常を描く伝説のアニメ。", episodeCount: 28 },
  { slug: "angel-beats", title: "Angel Beats!", type: "anime", description: "麻枝准脚本。死後の世界の学校を舞台にした感動アニメ。", episodeCount: 13, episodeTitles: { 13: "Graduation" } },
  { slug: "k-on", title: "けいおん！", type: "anime", description: "かきふらい原作。高校の軽音楽部の日常を描くほのぼのアニメ。", episodeCount: 13 },
  { slug: "lucky-star", title: "らき☆すた", type: "anime", description: "美水かがみ原作。女子高生の日常をゆるく描く日常系アニメ。", episodeCount: 24 },
  { slug: "ghost-in-shell-sac", title: "攻殻機動隊 S.A.C.", type: "anime", description: "士郎正宗原作。公安9課の活躍を描くサイバーパンクアニメ。", episodeCount: 26 },
  { slug: "sword-art-online", title: "ソードアート・オンライン", type: "anime", description: "川原礫原作。ゲームの世界に閉じ込められたプレイヤーの物語。", episodeCount: 25 },
  { slug: "no-game-no-life", title: "ノーゲーム・ノーライフ", type: "anime", description: "榎宮祐原作。ゲームの世界で命をかけて勝負するアニメ。", episodeCount: 12 },
  { slug: "overlord-anime", title: "オーバーロード", type: "anime", description: "丸山くがね原作。ゲームの世界に取り残されたプレイヤーの物語。", episodeCount: 13 },
  { slug: "konosuba-anime", title: "この素晴らしい世界に祝福を！", type: "anime", description: "暁なつめ原作。ダメな神様と異世界でコメディを繰り広げるアニメ。", episodeCount: 10 },
  { slug: "tensei-slime-anime", title: "転生したらスライムだった件", type: "anime", description: "伏瀬原作。スライムに転生した男の異世界建国記アニメ。", episodeCount: 24 },
  { slug: "re-zero-s2", title: "Re:ゼロから始める異世界生活 第2期", type: "anime", description: "スバルの最大の試練。エミリア陣営の聖域脱出を描く。", episodeCount: 25 },
  { slug: "that-time-slime", title: "転生したらスライムだった件 第2期", type: "anime", description: "リムルが魔王化を経験する第2期シリーズ。", episodeCount: 24 },
  { slug: "shield-hero-anime", title: "盾の勇者の成り上がり", type: "anime", description: "アネコユサギ原作。裏切られた盾の勇者の成り上がりアニメ。", episodeCount: 25 },
  { slug: "goblin-slayer-anime", title: "ゴブリンスレイヤー", type: "anime", description: "蝸牛くも原作。ゴブリン退治に特化した冒険者のアニメ。", episodeCount: 12 },
  { slug: "mushoku-tensei-anime", title: "無職転生 〜異世界行ったら本気だす〜", type: "anime", description: "理不尽な孫の手原作。引きこもりが異世界転生して本気で生きる物語。", episodeCount: 23 },
  { slug: "kaiju-no8-anime", title: "怪獣8号", type: "anime", description: "松本直也原作。怪獣討伐隊を目指す男の変身バトルアニメ。", episodeCount: 12 },
  { slug: "inuyasha-anime", title: "犬夜叉", type: "anime", description: "高橋留美子原作。現代の少女と戦国時代の半妖の物語。", episodeCount: 167 },
  { slug: "sailor-moon-anime", title: "美少女戦士セーラームーン", type: "anime", description: "武内直子原作。月野うさぎが守護戦士として戦う少女向けアニメ。", episodeCount: 200 },
  { slug: "cardcaptor-sakura-anime", title: "カードキャプターさくら", type: "anime", description: "CLAMP原作。魔法のカードを集める少女の物語のアニメ版。", episodeCount: 70 },
  { slug: "future-diary", title: "未来日記", type: "anime", description: "えすのサカエ原作。未来が見える日記を持つ者たちのサバイバル。", episodeCount: 26 },
  { slug: "seven-deadly-sins-anime", title: "七つの大罪", type: "anime", description: "鈴木央原作。伝説の騎士団の復活を描くファンタジーアニメ。", episodeCount: 24 },
  { slug: "dr-stone-anime", title: "Dr.STONE", type: "anime", description: "稲垣理一郎原作。石化した世界で文明を再建するサイエンスアニメ。", episodeCount: 24 },
  { slug: "promised-neverland-anime", title: "約束のネバーランド", type: "anime", description: "白井カイウ原作。孤児院の真実から脱出を図るサスペンスアニメ。", episodeCount: 12, episodeTitles: { 12: "150146" } },
  { slug: "tokyo-revengers-anime", title: "東京卍リベンジャーズ", type: "anime", description: "和久井健原作。タイムリープで過去を変えるヤンキーアニメ。", episodeCount: 24 },
  { slug: "demon-slayer-s3", title: "鬼滅の刃 刀鍛冶の里編", type: "anime", description: "鍛冶師たちの里を舞台にした鬼滅の刃第3期。", episodeCount: 11 },
  { slug: "demon-slayer-s4", title: "鬼滅の刃 柱稽古編", type: "anime", description: "柱たちとの修行を描く鬼滅の刃第4期。", episodeCount: 8 },
  { slug: "jujutsu-kaisen-s2", title: "呪術廻戦 第2期", type: "anime", description: "過去編と渋谷事変を描く呪術廻戦の第2期。", episodeCount: 23 },
  { slug: "vinland-saga-anime", title: "ヴィンランド・サガ", type: "anime", description: "幸村誠原作。ヴァイキングの少年トルフィンの復讐と成長を描くアニメ。", episodeCount: 24 },
  { slug: "mushoku-tensei-s2", title: "無職転生 II 〜異世界行ったら本気だす〜", type: "anime", description: "魔大陸编を含む無職転生第2期。", episodeCount: 25 },
  { slug: "summertime-render", title: "サマータイムレンダ", type: "anime", description: "田中靖規原作。離島の謎を解くサスペンスアニメ。", episodeCount: 25 },
  { slug: "lycoris-recoil", title: "リコリス・リコイル", type: "anime", description: "足立慎吾監督のオリジナルアニメ。女子高生エージェントのコンビを描く。", episodeCount: 13 },
  { slug: "bocchi-the-rock", title: "ぼっち・ざ・ろっく！", type: "anime", description: "はまじあき原作。ぼっちな少女がバンドを通じて成長する音楽アニメ。", episodeCount: 12 },
  { slug: "skip-loafer-anime", title: "スキップとローファー", type: "anime", description: "高松美咲原作。田舎から東京に出てきた少女の青春アニメ。", episodeCount: 13 },
  { slug: "oshi-no-ko-s2", title: "推しの子 第2期", type: "anime", description: "芸能界の闇をさらに深く描く推しの子第2期。", episodeCount: 13 },
  { slug: "blue-lock-s2", title: "ブルーロック VS U-20", type: "anime", description: "ブルーロック選抜とU-20日本代表の対決を描く第2期。", episodeCount: 13 },
  { slug: "frieren", title: "葬送のフリーレン", type: "anime", description: "山田鐘人原作。勇者パーティの魔法使いフリーレンの旅を描く。", episodeCount: 28, episodeTitles: { 1: "旅立ちの日" } },
  { slug: "solo-leveling", title: "俺だけレベルアップな件", type: "anime", description: "チュグン原作の韓国発ウェブ漫画アニメ化。最弱ハンターの成長物語。", episodeCount: 12 },
  { slug: "mashle-anime", title: "マッシュル", type: "anime", description: "甲本一原作。魔法のない少年が筋肉で魔法学校を生き抜くアニメ。", episodeCount: 12 },
  { slug: "undead-unluck", title: "アンデッドアンラック", type: "anime", description: "戸塚慶文原作。死なない男と不幸をもたらす女のバトルアニメ。", episodeCount: 24 },
  { slug: "dungeon-meshi-anime", title: "ダンジョン飯", type: "anime", description: "九井諒子原作。モンスターを料理しながらダンジョンを攻略するアニメ。", episodeCount: 24 },
  { slug: "kaijuu-8-s2", title: "怪獣8号 第2期", type: "anime", description: "防衛隊との戦いを描く怪獣8号の続編。", episodeCount: 12 },
  { slug: "resonant-blue", title: "アオアシ", type: "anime", description: "小林有吾原作。サッカーの才能が開花する少年の物語。", episodeCount: 24 },
  { slug: "wind-breaker", title: "WIND BREAKER", type: "anime", description: "にいさとる原作。不良少年が街を守る組織に入るアニメ。", episodeCount: 13 },
  { slug: "makeine", title: "負けヒロインが多すぎる！", type: "anime", description: "雨森たきの原作。恋に破れた女の子たちの青春アニメ。", episodeCount: 13 },
  { slug: "shanfreak", title: "シャングリラ・フロンティア", type: "anime", description: "硬梨菜原作。クソゲーハンターが最高峰VRMMOに挑むアニメ。", episodeCount: 25 },
  { slug: "bucchigire", title: "ぶっちぎれ！", type: "anime", description: "幕末を舞台にした鬼退治アニメ。", episodeCount: 12 },
  { slug: "black-summoner", title: "ブラック・サマナー", type: "anime", description: "異世界転生した召喚士の物語。", episodeCount: 12 },
  { slug: "trapped-training-world", title: "ありふれた職業で世界最強", type: "anime", description: "白米良原作。最弱クラスの少年が最強に至る異世界アニメ。", episodeCount: 13 },
  { slug: "to-your-eternity", title: "不滅のあなたへ", type: "anime", description: "大今良時原作。不死の存在が人間と交流しながら成長する物語。", episodeCount: 20 },
  { slug: "86-eighty-six", title: "86—エイティシックス—", type: "anime", description: "安里アサト原作。差別された少年兵たちの戦争を描くアニメ。", episodeCount: 23, episodeTitles: { 23: "君の声は聞こえている" } },
  { slug: "aot-final", title: "進撃の巨人 The Final Season", type: "anime", description: "進撃の巨人の最終章。マーレ編から地鳴らしまでを描く。", episodeCount: 30 },
  { slug: "komi-san-anime", title: "古見さんは、コミュ症です。", type: "anime", description: "oda tomohito原作。コミュ障美少女古見さんの友達作りアニメ。", episodeCount: 12 },
  { slug: "wonder-egg-priority", title: "ワンダーエッグ・プライオリティ", type: "anime", description: "野島伸司脚本。少女たちが闘う謎のドリームワールドを描くアニメ。", episodeCount: 12 },
  { slug: "build-divide", title: "ビルド・ディバイド", type: "anime", description: "TCGバトルを題材にしたオリジナルアニメ。", episodeCount: 12 },
];

const DRAMA: EpisodeWork[] = [
  { slug: "hanzawa-naoki", title: "半沢直樹", type: "drama", description: "池井戸潤原作。倍返しで挑む銀行員の痛快ドラマ。TBS系。", episodeCount: 10 },
  { slug: "gto", title: "GTO", type: "drama", description: "藤沢とおる原作。元不良の熱血教師・鬼塚英吉の奮闘を描くドラマ。", episodeCount: 12 },
  { slug: "kaseifu-no-mita", title: "家政婦のミタ", type: "drama", description: "無表情で何でもこなす家政婦・三田灯と家族の物語。日テレ系。", episodeCount: 10 },
  { slug: "doctor-x", title: "ドクターX", type: "drama", description: "フリーランス外科医・大門未知子の「私、失敗しないので」が決め台詞。テレビ朝日系。", episodeCount: 10 },
  { slug: "nigehaji", title: "逃げるは恥だが役に立つ", type: "drama", description: "海野つなみ原作。契約結婚をする二人のラブコメディドラマ。TBS系。", episodeCount: 11 },
  { slug: "kounodori", title: "コウノドリ", type: "drama", description: "鈴ノ木ユウ原作。産科医と助産師たちの感動の物語。TBS系。", episodeCount: 10 },
  { slug: "quartet", title: "カルテット", type: "drama", description: "坂元裕二脚本。軽井沢のカルテットをめぐる群像ドラマ。TBS系。", episodeCount: 10 },
  { slug: "unnatural", title: "アンナチュラル", type: "drama", description: "野木亜紀子脚本。法医解剖医たちの活躍を描く医療ドラマ。TBS系。", episodeCount: 10 },
  { slug: "miu404", title: "MIU404", type: "drama", description: "野木亜紀子脚本。機動捜査隊のバディ刑事ドラマ。TBS系。", episodeCount: 10 },
  { slug: "legal-high", title: "リーガルハイ", type: "drama", description: "古沢良太脚本。勝訴率100%の変人弁護士・古美門研介の活躍。フジ系。", episodeCount: 10 },
  { slug: "woman", title: "Woman", type: "drama", description: "坂元裕二脚本。シングルマザーの過酷な生き様を描く感動ドラマ。NTV系。", episodeCount: 10 },
  { slug: "mother-drama", title: "Mother", type: "drama", description: "坂元裕二脚本。ネグレクトを受けた少女を救う母の愛の物語。NTV系。", episodeCount: 11 },
  { slug: "saikou-rikon", title: "最高の離婚", type: "drama", description: "坂元裕二脚本。二組の夫婦の結婚と離婚を描く恋愛ドラマ。フジ系。", episodeCount: 11 },
  { slug: "tokyo-love-story", title: "東京ラブストーリー", type: "drama", description: "柴門ふみ原作。フジTVの月9伝説ドラマ。カンチとリカの恋愛。", episodeCount: 11 },
  { slug: "long-vacation", title: "ロングバケーション", type: "drama", description: "無職男と結婚式から逃げた花嫁の奇妙な同居ラブドラマ。フジ系。", episodeCount: 11 },
  { slug: "keizoku", title: "ケイゾク", type: "drama", description: "複雑な未解決事件を次々解決する天才捜査員の物語。TBS系。", episodeCount: 12 },
  { slug: "kisarazu-cats-eye", title: "木更津キャッツアイ", type: "drama", description: "宮藤官九郎脚本。余命宣告された若者たちの青春群像劇。TBS系。", episodeCount: 12 },
  { slug: "nobuta-produce", title: "野ブタ。をプロデュース", type: "drama", description: "白岩玄原作。問題のある転入生をプロデュースする青春ドラマ。NTV系。", episodeCount: 10 },
  { slug: "densha-otoko", title: "電車男", type: "drama", description: "2chの実話をもとにしたオタク男子の恋愛コメディドラマ。フジ系。", episodeCount: 11 },
  { slug: "shirotokabe", title: "白い巨塔", type: "drama", description: "山崎豊子原作。医療界の権力闘争を描いた名作ドラマ。フジ系。", episodeCount: 21 },
  { slug: "sanada-maru", title: "真田丸", type: "drama", description: "三谷幸喜脚本の大河ドラマ。真田信繁（幸村）の波乱万丈を描く。", episodeCount: 50 },
  { slug: "kirin-ga-kuru", title: "麒麟がくる", type: "drama", description: "池端俊策脚本の大河ドラマ。明智光秀の生涯を描く。", episodeCount: 44 },
  { slug: "kamakura-dono", title: "鎌倉殿の13人", type: "drama", description: "三谷幸喜脚本の大河ドラマ。北条義時と13人の御家人の物語。", episodeCount: 48 },
  { slug: "dosu-ieyasu", title: "どうする家康", type: "drama", description: "古沢良太脚本の大河ドラマ。徳川家康の決断と葛藤を描く。", episodeCount: 48 },
  { slug: "hikaru-kimi", title: "光る君へ", type: "drama", description: "大石静脚本の大河ドラマ。源氏物語の作者・紫式部の生涯。", episodeCount: 48 },
  { slug: "kita-no-kuni-kara", title: "北の国から", type: "drama", description: "倉本聰脚本。大自然の中で生きる黒板家族の物語。フジ系。", episodeCount: 24 },
  { slug: "odoru-daisosasen", title: "踊る大捜査線", type: "drama", description: "君塚良一脚本。湾岸署の型破り刑事・青島俊作の活躍。フジ系。", episodeCount: 11 },
  { slug: "hero-drama", title: "HERO", type: "drama", description: "木村拓哉主演。型破りな検察官・久利生公平の事件解決ドラマ。フジ系。", episodeCount: 11 },
  { slug: "love-generation", title: "ラブジェネレーション", type: "drama", description: "木村拓哉・松嶋菜々子主演の王道ラブストーリー。フジ系月9。", episodeCount: 11 },
  { slug: "beautiful-life", title: "ビューティフルライフ", type: "drama", description: "木村拓哉・常盤貴子主演。車椅子の図書館員との純愛ドラマ。TBS系。", episodeCount: 10 },
  { slug: "galileo-drama", title: "ガリレオ", type: "drama", description: "東野圭吾原作。天才物理学者・湯川学が謎を解くミステリドラマ。フジ系。", episodeCount: 10 },
  { slug: "furuhata-ninzaburo", title: "古畑任三郎", type: "drama", description: "三谷幸喜脚本。倒叙推理ドラマの名作。田村正和主演。フジ系。", episodeCount: 12 },
  { slug: "ohsama-restaurant", title: "王様のレストラン", type: "drama", description: "三谷幸喜脚本。フレンチレストランを舞台にした群像劇。フジ系。", episodeCount: 10 },
  { slug: "tenno-ryori", title: "天皇の料理番", type: "drama", description: "杉森久英原作。宮内省の料理人になった男の生涯を描く伝記ドラマ。", episodeCount: 10 },
  { slug: "amachan", title: "あまちゃん", type: "drama", description: "宮藤官九郎脚本のNHK朝ドラ。岩手の海女から東京アイドルを目指す物語。", episodeCount: 156 },
  { slug: "hana-yori-dango-drama", title: "花より男子", type: "drama", description: "神尾葉子原作の少女漫画ドラマ化。F4と庶民少女のラブストーリー。TBS系。", episodeCount: 9 },
  { slug: "1-litre-namida", title: "1リットルの涙", type: "drama", description: "実話をもとにした難病と闘う少女・木藤亜也の感動ドラマ。フジ系。", episodeCount: 11 },
  { slug: "aibou", title: "相棒", type: "drama", description: "内田康夫原作。杉下右京と変わる相棒の名コンビ刑事ドラマ。テレビ朝日系。", episodeCount: 24 },
  { slug: "kodoku-gourmet", title: "孤独のグルメ", type: "drama", description: "谷口ジロー原作。独り飯を淡々と楽しむサラリーマンの食ドラマ。テレビ東京系。", episodeCount: 12 },
  { slug: "99-9", title: "99.9 刑事専門弁護士", type: "drama", description: "松本潤主演。無罪率0.1%以下の刑事裁判に挑む弁護士ドラマ。TBS系。", episodeCount: 10 },
  { slug: "gran-maison-tokyo", title: "グランメゾン東京", type: "drama", description: "木村拓哉主演。ミシュラン三ツ星を目指す料理人の物語。TBS系。", episodeCount: 11 },
  { slug: "heaven-hell", title: "天国と地獄〜サイコな2人〜", type: "drama", description: "人格が入れ替わった刑事と殺人犯のサスペンスドラマ。TBS系。", episodeCount: 10 },
  { slug: "daizu-towako", title: "大豆田とわ子と三人の元夫", type: "drama", description: "坂元裕二脚本。3人の元夫と関係を続けるシングルマザーの物語。フジ系。", episodeCount: 10 },
  { slug: "ore-ie-hanashi", title: "俺の家の話", type: "drama", description: "宮藤官九郎脚本。プロレスラーと能楽師家族のホームコメディ。TBS系。", episodeCount: 10 },
  { slug: "saifu", title: "最愛", type: "drama", description: "奥平謙二脚本。12年前の事件の真実と愛を描くサスペンスラブドラマ。TBS系。", episodeCount: 10 },
  { slug: "silent-drama", title: "サイレント", type: "drama", description: "生方美久脚本。聴覚障害を持つ青年と幼なじみの再会を描く恋愛ドラマ。フジ系。", episodeCount: 11 },
  { slug: "mystery-iu-nakare", title: "ミステリと言う勿れ", type: "drama", description: "田村由美原作。独自の思考でミステリを解く青年のドラマ。フジ系。", episodeCount: 10 },
  { slug: "nijiiro-karsuma", title: "ハコヅメ〜たたかう！交番女子〜", type: "drama", description: "泰三子原作。女性警官たちの日常を描くコメディドラマ。NTV系。", episodeCount: 10 },
  { slug: "shimamura", title: "下町ロケット", type: "drama", description: "池井戸潤原作。中小企業が宇宙ロケット部品開発に挑むドラマ。TBS系。", episodeCount: 10 },
  { slug: "rikio", title: "陸王", type: "drama", description: "池井戸潤原作。廃業寸前の足袋店が新製品開発で挑む感動ドラマ。TBS系。", episodeCount: 10 },
  { slug: "no-side-game", title: "ノーサイド・ゲーム", type: "drama", description: "池井戸潤原作。左遷されたサラリーマンがラグビーチームを再建する物語。TBS系。", episodeCount: 10 },
  { slug: "nagi-no-oyabu", title: "凪のお暇", type: "drama", description: "コナリミサト原作。全てをリセットして自分を見つけ直す女性の物語。TBS系。", episodeCount: 10 },
  { slug: "ima-kore-ha", title: "今日から俺は!!", type: "drama", description: "西森博之原作のヤンキーコメディドラマ。金髪と茶髪の二人の物語。NTV系。", episodeCount: 10 },
  { slug: "theseus-ship", title: "テセウスの船", type: "drama", description: "東元俊哉原作。連続殺人犯の息子が過去にタイムスリップするドラマ。TBS系。", episodeCount: 10 },
  { slug: "dragon-ryu-drama", title: "ドラゴン桜", type: "drama", description: "三田紀房原作。弁護士が偏差値最底辺の高校生を東大合格に導くドラマ。TBS系。", episodeCount: 11 },
  { slug: "rokkopon-class", title: "六本木クラス", type: "drama", description: "韓国ドラマ「梨泰院クラス」の日本リメイク。復讐と夢を描く。テレビ朝日系。", episodeCount: 12 },
  { slug: "hanbei-sou", title: "半沢直樹2", type: "drama", description: "池井戸潤原作の半沢直樹続編。銀行合併とメディア買収を巡る権力闘争。TBS系。", episodeCount: 10 },
  { slug: "first-penguin", title: "ファーストペンギン！", type: "drama", description: "漁師町に現れたシングルマザーが水産業を変革するドラマ。NTV系。", episodeCount: 8 },
  { slug: "masashige", title: "正直不動産", type: "drama", description: "大谷アキラ原作。嘘がつけなくなった不動産屋の奮闘を描くコメディ。NHK系。", episodeCount: 10 },
  { slug: "hatsukoi", title: "初めて恋をした日に読む話", type: "drama", description: "持田あき原作。27歳の家庭教師と3人の男性の恋愛ドラマ。TBS系。", episodeCount: 10 },
  { slug: "star-falling", title: "星降る夜に", type: "drama", description: "産科医と手話通訳士の純愛ドラマ。テレビ朝日系。", episodeCount: 10 },
  { slug: "koisuru-tsuzuku", title: "恋はつづくよどこまでも", type: "drama", description: "円城寺マキ原作。鬼教官の外科医と新人看護師の恋愛ドラマ。TBS系。", episodeCount: 10 },
  { slug: "kazarimono", title: "着飾る恋には理由があって", type: "drama", description: "インテリアデザイナーとエンジニアのシェアハウスラブドラマ。TBS系。", episodeCount: 10 },
  { slug: "homeroom-drama", title: "今ここにある危機とぼくの好感度について", type: "drama", description: "山本幸久原作。大学広報部員が危機対応に奮闘するブラックコメディ。NHK系。", episodeCount: 8 },
  { slug: "shinmai-mama", title: "コントが始まる", type: "drama", description: "生方美久脚本。解散を決めたコントトリオの最後の夜を描く群像劇。NTV系。", episodeCount: 10 },
  { slug: "yoru-no-hikari", title: "大恋愛〜僕を忘れる君と〜", type: "drama", description: "若年性アルツハイマーの小説家と医師の純愛ドラマ。TBS系。", episodeCount: 10 },
  { slug: "brushup-life", title: "ブラッシュアップライフ", type: "drama", description: "宮藤官九郎脚本。人生をやり直せるループで友達との絆を描くコメディ。NTV系。", episodeCount: 10 },
  { slug: "sexy-tanakasan", title: "セクシー田中さん", type: "drama", description: "芦原妃名子原作。ベリーダンスを通じて自分を取り戻すOLの物語。NTV系。", episodeCount: 10 },
  { slug: "nichiyou-yoru", title: "日曜の夜ぐらいは...", type: "drama", description: "水田沙也加脚本。さまざまな境遇の若者3人が出会う感動ドラマ。テレ朝系。", episodeCount: 9 },
  { slug: "ryusei-drama", title: "流星ワゴン", type: "drama", description: "重松清原作。タイムスリップして父と過去の自分に出会う家族ドラマ。TBS系。", episodeCount: 10 },
  { slug: "nippon-noir", title: "ニッポンノワール", type: "drama", description: "検察のエリート女性が事件の核心に迫るサスペンスドラマ。NTV系。", episodeCount: 10 },
  { slug: "onna-joushu", title: "おんな城主 直虎", type: "drama", description: "大河ドラマ。戦国時代の女城主・井伊直虎の生涯を描く。", episodeCount: 50 },
  { slug: "yoshida-drama", title: "吉原炎上", type: "drama", description: "吉原遊郭を舞台にした時代劇ドラマ。", episodeCount: 12 },
  { slug: "daisuchi", title: "大地の子", type: "drama", description: "山崎豊子原作。中国残留孤児の過酷な運命を描く感動ドラマ。NHK系。", episodeCount: 8 },
  { slug: "nijiiro-carte", title: "にじいろカルテ", type: "drama", description: "北海道の山奥の小さな診療所を舞台にした心温まる医療ドラマ。テレ朝系。", episodeCount: 10 },
  { slug: "suna-no-shiro", title: "砂の塔〜知ってはいけない隣人〜", type: "drama", description: "隣人の秘密をめぐるサスペンスドラマ。TBS系。", episodeCount: 10 },
  { slug: "kotaro-alone", title: "コタローは1人暮らし", type: "drama", description: "津村マミ原作。4歳の子供が一人で暮らす謎とほっこりする日常を描くドラマ。テレ朝系。", episodeCount: 8 },
  { slug: "uchi-no-musume", title: "ウチの娘は、彼氏が出来ない!!", type: "drama", description: "深田恭子・三浦友和主演。恋愛苦手な漫画家娘と父の物語。NTV系。", episodeCount: 10 },
  { slug: "byouin-drama", title: "病院の治し方〜ドクター有原の挑戦〜", type: "drama", description: "経営危機に瀕した病院を再生する医師の物語。テレビ東京系。", episodeCount: 10 },
  { slug: "coffee-drama", title: "珈琲いかがでしょう", type: "drama", description: "コナリミサト原作。移動珈琲屋台の青年が訪れる人々の悩みをほぐす物語。テレビ東京系。", episodeCount: 10 },
  { slug: "kuitan", title: "くいたん", type: "drama", description: "美食探偵が食をヒントに事件を解決するドラマ。", episodeCount: 10 },
  { slug: "tantei-drama", title: "探偵の探偵", type: "drama", description: "松岡圭祐原作。悪徳探偵をターゲットにする女探偵の物語。フジ系。", episodeCount: 10 },
  { slug: "wotakoi-drama", title: "ヲタクに恋は難しい", type: "drama", description: "ふじた原作。社会人オタクたちの恋愛コメディドラマ。NTV系。", episodeCount: 11 },
  { slug: "watashi-novel", title: "私 結婚できないんじゃなくて、しないんです", type: "drama", description: "独身主義の女性と彼女に惹かれる男性のラブコメドラマ。TBS系。", episodeCount: 10 },
  { slug: "hirugao", title: "昼顔〜平日午後3時の恋人たち〜", type: "drama", description: "不倫をテーマにした衝撃のドラマ。フジ系。", episodeCount: 10 },
  { slug: "legal-high-2", title: "リーガルハイ2", type: "drama", description: "古沢良太脚本の続編。勝訴率100%弁護士のシーズン2。フジ系。", episodeCount: 10 },
  { slug: "school-drama", title: "ごめんね青春！", type: "drama", description: "宮藤官九郎脚本。男子校と女子校が合併する高校の物語。TBS系。", episodeCount: 10 },
  { slug: "hakui-no-drama", title: "コードブルー〜ドクターヘリ緊急救命〜", type: "drama", description: "航空救命医療を担うフライトドクターの物語。フジ系。", episodeCount: 11 },
  { slug: "kinpachi-sensei", title: "3年B組金八先生", type: "drama", description: "社会問題を取り上げながら中学生と向き合う教師の物語。TBS系。", episodeCount: 12 },
  { slug: "good-doctor-jp", title: "グッド・ドクター", type: "drama", description: "韓国ドラマ原作。自閉症の天才外科医が活躍する医療ドラマ。フジ系。", episodeCount: 11 },
  { slug: "sumika", title: "住住", type: "drama", description: "ミムラ原作。同じ部屋に住む男女の日常コメディ。テレビ東京系。", episodeCount: 10 },
  { slug: "blue-giant-drama", title: "ゆるキャン△ Season 2", type: "drama", description: "なでしこたちのキャンプ活動を描く癒しのドラマ第2期。テレ東系。", episodeCount: 12 },
  { slug: "vivant", title: "VIVANT", type: "drama", description: "堺雅人・阿部寛主演。モンゴルを舞台にスパイ組織を巡る大型エンターテインメントドラマ。TBS系。", episodeCount: 10, episodeTitles: { 1: "誤送金", 2: "追跡", 3: "対峙", 4: "砂漠", 5: "約束", 6: "真実", 7: "同志", 8: "裏切り", 9: "決断", 10: "VIVANT" } },
];

const MOVIES: EpisodeWork[] = [
  { slug: "spirited-away", title: "千と千尋の神隠し", type: "movie", description: "宮崎駿監督のスタジオジブリ映画。少女・千尋が神々の世界で働く物語。", episodeCount: 1 },
  { slug: "your-name", title: "君の名は。", type: "movie", description: "新海誠監督のアニメ映画。入れ替わる二人の運命的な恋愛。", episodeCount: 1 },
  { slug: "weathering-with-you", title: "天気の子", type: "movie", description: "新海誠監督。晴れ女の少女と家出少年の恋愛を描くアニメ映画。", episodeCount: 1 },
  { slug: "suzume", title: "すずめの戸締まり", type: "movie", description: "新海誠監督。日本各地の廃墟の扉を閉める少女の旅。", episodeCount: 1 },
  { slug: "mononoke-hime", title: "もののけ姫", type: "movie", description: "宮崎駿監督。人間と森の精霊の対立を描くスタジオジブリ映画。", episodeCount: 1 },
  { slug: "howl", title: "ハウルの動く城", type: "movie", description: "宮崎駿監督。老婆に変えられた少女とハウルの愛の物語。", episodeCount: 1 },
  { slug: "kiki", title: "魔女の宅急便", type: "movie", description: "宮崎駿監督。独り立ちする13歳の魔女・キキの成長物語。", episodeCount: 1 },
  { slug: "totoro", title: "となりのトトロ", type: "movie", description: "宮崎駿監督。田舎に引っ越した姉妹とトトロの出会いを描く。", episodeCount: 1 },
  { slug: "nausicaa", title: "風の谷のナウシカ", type: "movie", description: "宮崎駿監督。腐海と人間の共存を描くポスト黙示録ファンタジー。", episodeCount: 1 },
  { slug: "crimson-pig", title: "紅の豚", type: "movie", description: "宮崎駿監督。豚に変えられた飛行艇乗りポルコの物語。", episodeCount: 1 },
  { slug: "whisper-heart", title: "耳をすませば", type: "movie", description: "近藤喜文監督。少女と少年の夢と恋を描くスタジオジブリ映画。", episodeCount: 1 },
  { slug: "ponyo", title: "崖の上のポニョ", type: "movie", description: "宮崎駿監督。人間の少年と魚の女の子の出会いと愛を描く。", episodeCount: 1 },
  { slug: "the-wind-rises", title: "風立ちぬ", type: "movie", description: "宮崎駿監督。零戦を設計した堀越二郎の夢と愛の物語。", episodeCount: 1 },
  { slug: "grave-fireflies", title: "火垂るの墓", type: "movie", description: "高畑勲監督。戦時中に生きた兄妹の悲しい物語。", episodeCount: 1 },
  { slug: "kaguya-story", title: "かぐや姫の物語", type: "movie", description: "高畑勲監督。竹取物語をもとにしたかぐや姫の苦悩を描く。", episodeCount: 1 },
  { slug: "princess-mononoke-alt", title: "おもひでぽろぽろ", type: "movie", description: "高畑勲監督。都会のOLが田舎で過ごす夏と幼少期の記憶をつなぐ物語。", episodeCount: 1 },
  { slug: "marnie", title: "思い出のマーニー", type: "movie", description: "米林宏昌監督。内気な少女・杏奈と謎の少女マーニーの友情。", episodeCount: 1 },
  { slug: "5cm-per-second", title: "秒速5センチメートル", type: "movie", description: "新海誠監督。すれ違い続ける男女の恋愛をオムニバス形式で描く。", episodeCount: 1 },
  { slug: "garden-of-words", title: "言の葉の庭", type: "movie", description: "新海誠監督。雨の日の公園で出会う少年と女性の物語。", episodeCount: 1 },
  { slug: "wolf-children", title: "おおかみこどもの雨と雪", type: "movie", description: "細田守監督。人狼の子供を育てるシングルマザーの物語。", episodeCount: 1 },
  { slug: "summer-wars", title: "サマーウォーズ", type: "movie", description: "細田守監督。仮想空間OZで世界を守る少年と大家族の物語。", episodeCount: 1 },
  { slug: "the-girl-leapt-time", title: "時をかける少女", type: "movie", description: "細田守監督。タイムリープ能力を得た少女の青春と恋。", episodeCount: 1 },
  { slug: "the-boy-beast", title: "バケモノの子", type: "movie", description: "細田守監督。人間の少年が怪物の世界で育てられる物語。", episodeCount: 1 },
  { slug: "mirai", title: "未来のミライ", type: "movie", description: "細田守監督。弟が生まれた4歳の男の子と未来の妹の物語。", episodeCount: 1 },
  { slug: "belle-movie", title: "竜とそばかすの姫", type: "movie", description: "細田守監督。仮想世界で歌姫になった少女と竜の物語。", episodeCount: 1 },
  { slug: "akira-movie", title: "AKIRA", type: "movie", description: "大友克洋監督。2019年のネオ東京を舞台にしたSFアニメ映画の金字塔。", episodeCount: 1 },
  { slug: "ghost-in-shell-movie", title: "攻殻機動隊", type: "movie", description: "押井守監督。サイバーパンクSFアニメ映画の傑作。", episodeCount: 1 },
  { slug: "perfect-blue", title: "パーフェクトブルー", type: "movie", description: "今敏監督。アイドルから女優に転身した女性の心理サスペンス。", episodeCount: 1 },
  { slug: "millennium-actress", title: "千年女優", type: "movie", description: "今敏監督。伝説の女優の生涯をドキュメンタリーで辿る物語。", episodeCount: 1 },
  { slug: "tokyo-godfathers", title: "東京ゴッドファーザーズ", type: "movie", description: "今敏監督。ホームレス3人が拾ったことから始まるクリスマスの物語。", episodeCount: 1 },
  { slug: "the-girl-who-leapt", title: "時をかける少女(1983)", type: "movie", description: "大林宣彦監督の実写映画版。原田知世が主演した青春SF映画。", episodeCount: 1 },
  { slug: "maboroshi", title: "幻の光", type: "movie", description: "是枝裕和監督デビュー作。夫を突然失った女性の再生の物語。", episodeCount: 1 },
  { slug: "nobody-knows", title: "誰も知らない", type: "movie", description: "是枝裕和監督。親に置き去りにされた4人の子供たちの物語。", episodeCount: 1 },
  { slug: "shoplifters", title: "万引き家族", type: "movie", description: "是枝裕和監督。カンヌ映画祭パルムドール受賞。社会の底辺に生きる家族の物語。", episodeCount: 1 },
  { slug: "umimachi-diary", title: "海街diary", type: "movie", description: "是枝裕和監督。吉田秋生原作。鎌倉に暮らす三姉妹と異母妹の物語。", episodeCount: 1 },
  { slug: "like-a-father", title: "そして父になる", type: "movie", description: "是枝裕和監督。病院で取り違えられた二つの家族の物語。", episodeCount: 1 },
  { slug: "monster-kore", title: "怪物", type: "movie", description: "是枝裕和監督・坂元裕二脚本。同じ出来事を異なる視点から描く群像劇。", episodeCount: 1 },
  { slug: "drive-my-car", title: "ドライブ・マイ・カー", type: "movie", description: "濱口竜介監督。村上春樹原作。喪失を抱えた男の旅とチェーホフ劇を巡る物語。", episodeCount: 1 },
  { slug: "hana-taba", title: "花束みたいな恋をした", type: "movie", description: "坂元裕二脚本。サブカル趣味が合う二人の5年間の恋愛を描く。", episodeCount: 1 },
  { slug: "sion-sono-film", title: "愛のむきだし", type: "movie", description: "園子温監督。4時間の大作。ひとりの少年の歪んだ愛の物語。", episodeCount: 1 },
  { slug: "shin-godzilla", title: "シン・ゴジラ", type: "movie", description: "庵野秀明・樋口真嗣監督。現代日本にゴジラが上陸するリアル特撮映画。", episodeCount: 1 },
  { slug: "shin-ultraman", title: "シン・ウルトラマン", type: "movie", description: "庵野秀明脚本・樋口真嗣監督。ウルトラマンの現代リメイク映画。", episodeCount: 1 },
  { slug: "shin-evangelion", title: "シン・エヴァンゲリオン劇場版", type: "movie", description: "庵野秀明監督。エヴァンゲリオン新劇場版の完結編。", episodeCount: 1 },
  { slug: "infinite-train", title: "劇場版 鬼滅の刃 無限列車編", type: "movie", description: "鬼滅の刃の劇場版。煉獄杏寿郎と無限列車の鬼との戦い。歴代興行収入1位（日本）。", episodeCount: 1 },
  { slug: "one-piece-film-red", title: "ONE PIECE FILM RED", type: "movie", description: "ワンピースの劇場版。歌姫ウタをめぐる物語。", episodeCount: 1 },
  { slug: "doraemon-nobita-dino", title: "映画ドラえもん のび太の恐竜", type: "movie", description: "ドラえもん映画シリーズ第1作。ピー助と未来への旅。", episodeCount: 1 },
  { slug: "doraemon-empire", title: "映画クレヨンしんちゃん オトナ帝国の逆襲", type: "movie", description: "20世紀博への郷愁と親の愛を描くクレヨンしんちゃん屈指の名作映画。", episodeCount: 1 },
  { slug: "the-first-slam-dunk", title: "THE FIRST SLAM DUNK", type: "movie", description: "井上雄彦監督によるスラムダンク初の劇場版。宮城リョータを中心に描く。", episodeCount: 1 },
  { slug: "lupin-cagliostro", title: "ルパン三世 カリオストロの城", type: "movie", description: "宮崎駿監督によるルパン三世の劇場版。カリオストロ公国の謎を追う。", episodeCount: 1 },
  { slug: "conan-zero-executor", title: "名探偵コナン ゼロの執行人", type: "movie", description: "コナン映画最大ヒット作。安室透の秘密に迫るサスペンス劇場版。", episodeCount: 1 },
  { slug: "conan-haibara", title: "名探偵コナン 100万ドルの五稜星", type: "movie", description: "服部平次と赤井秀一が共闘するコナン映画。", episodeCount: 1 },
  { slug: "my-neighbor-yamada", title: "ホーホケキョ となりの山田くん", type: "movie", description: "高畑勲監督。ほのぼの家族漫画の映画化。独特の絵柄が特徴。", episodeCount: 1 },
  { slug: "arietty", title: "借りぐらしのアリエッティ", type: "movie", description: "米林宏昌監督。小人族アリエッティと人間の少年の出会いを描く。", episodeCount: 1 },
  { slug: "from-up-poppy-hill", title: "コクリコ坂から", type: "movie", description: "宮崎吾朗監督。1963年横浜を舞台にした青春ラブストーリー。", episodeCount: 1 },
  { slug: "blue-giant-movie", title: "BLUE GIANT", type: "movie", description: "石塚真一原作。ジャズに魂を燃やす若者たちの夢と情熱を描くアニメ映画。", episodeCount: 1 },
  { slug: "kagami-no-kojou", title: "かがみの孤城", type: "movie", description: "辻村深月原作のベストセラー小説アニメ映画化。鏡の中の城に集まった7人の子供たちの物語。", episodeCount: 1 },
  { slug: "evangelion-1", title: "ヱヴァンゲリヲン新劇場版：序", type: "movie", description: "庵野秀明監督。TV版の再構成第1弾。ヤシマ作戦を中心に描く。", episodeCount: 1 },
  { slug: "evangelion-2", title: "ヱヴァンゲリヲン新劇場版：破", type: "movie", description: "庵野秀明監督。TV版からの独自展開が始まる第2弾。", episodeCount: 1 },
  { slug: "evangelion-3", title: "ヱヴァンゲリヲン新劇場版：Q", type: "movie", description: "庵野秀明監督。14年後の世界を描く第3弾。", episodeCount: 1 },
  { slug: "inu-oh", title: "犬王", type: "movie", description: "湯浅政明監督。室町時代の能楽師・犬王と琵琶法師の友情と音楽を描く。", episodeCount: 1 },
  { slug: "pom-poko", title: "平成狸合戦ぽんぽこ", type: "movie", description: "高畑勲監督。宅地開発に対抗するたぬきたちの物語。", episodeCount: 1 },
  { slug: "ai-no-utagoe", title: "アイの歌声を聴かせて", type: "movie", description: "吉浦康裕監督。AIの転校生シオンと5人の高校生の青春を描くオリジナルアニメ映画。", episodeCount: 1 },
  { slug: "blue-period-movie", title: "ブルーピリオド", type: "movie", description: "山口つばさ原作。美術に目覚めた高校生が東京芸大を目指す物語の映画版。", episodeCount: 1 },
  { slug: "lost-care", title: "ロストケア", type: "movie", description: "葉真中顕原作。介護殺人犯と検事の対話を描く社会派映画。松山ケンイチ主演。", episodeCount: 1 },
  { slug: "promare", title: "プロメア", type: "movie", description: "今石洋之監督・中島かずき脚本。炎を操るバーニッシュと消防隊の戦いを描く。", episodeCount: 1 },
  { slug: "misaki-mayoiga", title: "岬のマヨイガ", type: "movie", description: "柏葉幸子原作。岬の一軒家に住みついたおばあさんと少女たちの物語のアニメ映画。", episodeCount: 1 },
  { slug: "liz-blue-bird", title: "リズと青い鳥", type: "movie", description: "山田尚子監督。吹奏楽部の二人の少女の繊細な関係を描く。", episodeCount: 1 },
  { slug: "sound-euphonium-movie", title: "響け！ユーフォニアム〜誓いのフィナーレ〜", type: "movie", description: "山田尚子監督。久美子たちの高校吹奏楽部の集大成。", episodeCount: 1 },
  { slug: "a-whisker-away", title: "泣きたい私は猫をかぶる", type: "movie", description: "Netflix配信のオリジナルアニメ映画。猫に変身できる少女の物語。", episodeCount: 1 },
  { slug: "josee-tiger-fish", title: "ジョゼと虎と魚たち", type: "movie", description: "田辺聖子原作のアニメ映画。車椅子の少女ジョゼと大学生の恋愛。", episodeCount: 1 },
  { slug: "i-want-eat-pancreas", title: "君の膵臓をたべたい", type: "movie", description: "住野よる原作のアニメ映画。余命宣告された少女と地味な少年の物語。", episodeCount: 1 },
  { slug: "anthem-heart", title: "心が叫びたがってるんだ。", type: "movie", description: "岡田麿里脚本のオリジナルアニメ映画。言葉を封じられた少女の物語。", episodeCount: 1 },
  { slug: "haken-anime", title: "ハケンアニメ！", type: "movie", description: "辻村深月原作。覇権アニメを目指す制作者たちの情熱を描く実写映画。", episodeCount: 1 },
  { slug: "suzushiro-movie", title: "数分間のエールを", type: "movie", description: "映像研究部の少女とミュージックビデオに魂を込める少年の青春アニメ映画。", episodeCount: 1 },
  { slug: "haikyuu-movie-dumpster", title: "ハイキュー!! ゴミ捨て場の決戦", type: "movie", description: "烏野と音駒の宿命の対決を描く劇場版ハイキュー。", episodeCount: 1 },
  { slug: "haikyuu-movie-decisive", title: "ハイキュー!! 頂の景色", type: "movie", description: "ハイキュー劇場版シリーズ後編。全国大会決勝を描く。", episodeCount: 1 },
  { slug: "jujutsu-kaisen-0", title: "劇場版 呪術廻戦 0", type: "movie", description: "呪術廻戦の前日譚を描く劇場版。乙骨憂太が主人公。", episodeCount: 1 },
  { slug: "mha-movie-world-heroes", title: "僕のヒーローアカデミア THE MOVIE ワールドヒーローズミッション", type: "movie", description: "ヒロアカ劇場版第3弾。超能力否定組織との戦い。", episodeCount: 1 },
  { slug: "db-broly", title: "ドラゴンボール超 ブロリー", type: "movie", description: "伝説の超サイヤ人ブロリーとの戦いを描く劇場版。鳥山明が脚本。", episodeCount: 1 },
  { slug: "naruto-last-movie", title: "THE LAST -NARUTO THE MOVIE-", type: "movie", description: "ナルトとヒナタの恋愛に焦点を当てた劇場版ナルト。", episodeCount: 1 },
  { slug: "boruto-movie", title: "BORUTO -NARUTO THE MOVIE-", type: "movie", description: "ナルトの息子・ボルトが主人公の劇場版。", episodeCount: 1 },
  { slug: "one-piece-stampede", title: "ONE PIECE STAMPEDE", type: "movie", description: "海賊大集合の祭典を描くワンピース劇場版。", episodeCount: 1 },
  { slug: "conan-scarlet-bullet", title: "名探偵コナン 緋色の弾丸", type: "movie", description: "赤井秀一とコナンが活躍するコナン劇場版。", episodeCount: 1 },
  { slug: "evangelion-fin", title: "エヴァンゲリオン劇場版（旧）Air/まごころを、君に", type: "movie", description: "TV版の別エンディングを描いた旧劇場版。", episodeCount: 1 },
  { slug: "whisper-sea", title: "海がきこえる", type: "movie", description: "スタジオジブリ制作のTVムービー。土佐出身の少年と転校生の思い出。", episodeCount: 1 },
  { slug: "ronja", title: "山賊の娘ローニャ", type: "movie", description: "宮崎吾朗監督のCGアニメ映画。アストリッド・リンドグレーン原作。", episodeCount: 1 },
  { slug: "red-turtle", title: "レッドタートル ある島の物語", type: "movie", description: "スタジオジブリとの共同制作。無人島に流れ着いた男と赤い亀の物語。", episodeCount: 1 },
  { slug: "earwig-witch", title: "アーヤと魔女", type: "movie", description: "宮崎吾朗監督のCGアニメ映画。孤児院で育った少女が魔女の家へ。", episodeCount: 1 },
  { slug: "the-boy-heron", title: "君たちはどう生きるか", type: "movie", description: "宮崎駿監督。アオサギに導かれた少年が異世界へ旅する物語。アカデミー賞受賞。", episodeCount: 1 },
  { slug: "kubi-movie", title: "首", type: "movie", description: "北野武監督。本能寺の変前夜の謀略を描いた歴史映画。", episodeCount: 1 },
  { slug: "the-fable-movie", title: "ザ・ファブル", type: "movie", description: "南勝久原作。最強の殺し屋が一般人として生活する実写映画。岡田准一主演。", episodeCount: 1 },
  { slug: "flow-the-movie", title: "流浪の月", type: "movie", description: "凪良ゆう原作。誘拐犯と被害者という関係の二人の再会。", episodeCount: 1 },
  { slug: "beeswax-thunder", title: "蜜蜂と遠雷", type: "movie", description: "恩田陸原作直木賞受賞作の映画化。国際ピアノコンクールを舞台にした物語。", episodeCount: 1 },
  { slug: "yakuza-family", title: "ヤクザと家族 The Family", type: "movie", description: "藤井道人監督。ヤクザに育てられた青年の30年を描く社会派映画。", episodeCount: 1 },
  { slug: "goodbye-boys", title: "さよならの朝に約束の花をかざろう", type: "movie", description: "岡田麿里監督作品。不老の少女と人間の少年の数百年の物語。", episodeCount: 1 },
];

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL が設定されていません");

  const db = createDb(url);
  console.log("既存データをクリア中...");
  await db.execute(sql`TRUNCATE works RESTART IDENTITY CASCADE`);

  console.log("\n漫画データを投入中...");
  for (const work of MANGA) {
    const [inserted] = await db
      .insert(works)
      .values({ slug: work.slug, title: work.title, type: "manga", description: work.description })
      .returning();

    const totalVolumes = Math.ceil(work.chapters / work.chaptersPerVolume);

    // 巻単位エントリ（episodeNumber = null）
    const volumeRows = Array.from({ length: totalVolumes }, (_, i) => ({
      workId: inserted.id,
      episodeNumber: null,
      volumeNumber: i + 1,
    }));
    for (let i = 0; i < volumeRows.length; i += 500) {
      await db.insert(episodes).values(volumeRows.slice(i, i + 500));
    }

    // 話単位エントリ（volumeNumber = null、巻との紐付けなし）
    const chapterRows = Array.from({ length: work.chapters }, (_, i) => ({
      workId: inserted.id,
      episodeNumber: i + 1,
      volumeNumber: null,
      title: work.chapterTitles?.[i + 1],
    }));
    for (let i = 0; i < chapterRows.length; i += 500) {
      await db.insert(episodes).values(chapterRows.slice(i, i + 500));
    }

    console.log(`✓ ${work.title}（${totalVolumes}巻・${work.chapters}話）`);
  }

  console.log("\nアニメデータを投入中...");
  for (const work of ANIME) {
    const [inserted] = await db
      .insert(works)
      .values({ slug: work.slug, title: work.title, type: work.type, description: work.description })
      .returning();

    const epRows = Array.from({ length: work.episodeCount }, (_, i) => ({
      workId: inserted.id,
      episodeNumber: i + 1,
      title: work.episodeTitles?.[i + 1],
    }));

    if (epRows.length > 0) {
      for (let i = 0; i < epRows.length; i += 500) {
        await db.insert(episodes).values(epRows.slice(i, i + 500));
      }
    }
    console.log(`✓ ${work.title}（${work.episodeCount}話）`);
  }

  console.log("\nドラマデータを投入中...");
  for (const work of DRAMA) {
    const [inserted] = await db
      .insert(works)
      .values({ slug: work.slug, title: work.title, type: work.type, description: work.description })
      .returning();

    const epRows = Array.from({ length: work.episodeCount }, (_, i) => ({
      workId: inserted.id,
      episodeNumber: i + 1,
      title: work.episodeTitles?.[i + 1],
    }));

    if (epRows.length > 0) {
      for (let i = 0; i < epRows.length; i += 500) {
        await db.insert(episodes).values(epRows.slice(i, i + 500));
      }
    }
    console.log(`✓ ${work.title}（${work.episodeCount}話）`);
  }

  console.log("\n映画データを投入中...");
  for (const work of MOVIES) {
    const [inserted] = await db
      .insert(works)
      .values({ slug: work.slug, title: work.title, type: work.type, description: work.description })
      .returning();

    await db.insert(episodes).values({ workId: inserted.id, episodeNumber: 1, title: "本編" });
    console.log(`✓ ${work.title}`);
  }

  const mangaCount = MANGA.length;
  const animeCount = ANIME.length;
  const dramaCount = DRAMA.length;
  const movieCount = MOVIES.length;
  console.log(`\n完了！合計 ${mangaCount + animeCount + dramaCount + movieCount} 作品`);
  console.log(`  漫画: ${mangaCount}作品 / アニメ: ${animeCount}作品 / ドラマ: ${dramaCount}作品 / 映画: ${movieCount}作品`);
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
