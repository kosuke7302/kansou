// afb提供のHulu用バナー素材（管理画面上で発行されたものをそのまま使用。Hulu本体からの画像流用ではない）
const HULU_BANNER = {
  imgSrc: "https://www.afi-b.com/upload_image/8792-1515374326-3.jpg",
  width: 234,
  height: 60,
  alt: "Hulu",
  pixelSrc: "https://t.afi-b.com/lead/G8792C/d991429d/y315961m",
};

const PLATFORM_INFO: Record<string, {
  label: string;
  bgColor: string;
  serviceUrl: string;
  affiliateEnv: string;
}> = {
  netflix: {
    label: "Netflix",
    bgColor: "bg-red-600",
    serviceUrl: "https://www.netflix.com/jp/",
    affiliateEnv: "AFFILIATE_URL_NETFLIX",
  },
  amazon_prime: {
    label: "Prime Video",
    bgColor: "bg-sky-500",
    serviceUrl: "https://www.amazon.co.jp/gp/video/primesignup",
    affiliateEnv: "AFFILIATE_URL_AMAZON_PRIME",
  },
  disney_plus: {
    label: "Disney+",
    bgColor: "bg-blue-800",
    serviceUrl: "https://www.disneyplus.com/ja-jp",
    affiliateEnv: "AFFILIATE_URL_DISNEY_PLUS",
  },
  hulu: {
    label: "Hulu",
    bgColor: "bg-green-600",
    serviceUrl: "https://www.hulu.jp/",
    affiliateEnv: "AFFILIATE_URL_HULU",
  },
  u_next: {
    label: "U-NEXT",
    bgColor: "bg-ink",
    serviceUrl: "https://video.unext.jp/",
    affiliateEnv: "AFFILIATE_URL_U_NEXT",
  },
  d_anime: {
    label: "dアニメストア",
    bgColor: "bg-pink-600",
    serviceUrl: "https://animestore.docomo.ne.jp/animestore/",
    affiliateEnv: "AFFILIATE_URL_D_ANIME",
  },
  abema: {
    label: "ABEMA",
    bgColor: "bg-teal-500",
    serviceUrl: "https://abema.tv/",
    affiliateEnv: "AFFILIATE_URL_ABEMA",
  },
  lemino: {
    label: "Lemino",
    bgColor: "bg-accent-800",
    serviceUrl: "https://lemino.docomo.ne.jp/",
    affiliateEnv: "AFFILIATE_URL_LEMINO",
  },
  fod: {
    label: "FOD Premium",
    bgColor: "bg-rose-600",
    serviceUrl: "https://fod.fujitv.co.jp/",
    affiliateEnv: "AFFILIATE_URL_FOD",
  },
  tver: {
    label: "TVer",
    bgColor: "bg-amber-500",
    serviceUrl: "https://tver.jp/",
    affiliateEnv: "AFFILIATE_URL_TVER",
  },
  dmm_tv: {
    label: "DMM TV",
    bgColor: "bg-neutral-800",
    serviceUrl: "https://tv.dmm.com/vod/",
    affiliateEnv: "AFFILIATE_URL_DMM_TV",
  },
  telasa: {
    label: "TELASA",
    bgColor: "bg-cyan-600",
    serviceUrl: "https://www.telasa.jp/",
    affiliateEnv: "AFFILIATE_URL_TELASA",
  },
  anime_times: {
    label: "アニメタイムズ",
    bgColor: "bg-violet-600",
    serviceUrl: "https://anime-times.jp/",
    affiliateEnv: "AFFILIATE_URL_ANIME_TIMES",
  },
};

export function StreamingBanner({ platforms }: { platforms: (string | null)[] | null }) {
  // アフィリエイトリンクが設定されていない配信サービスは、「PR/アフィリエイト広告を含みます」
  // という表示と実態が食い違ってしまうため掲載しない
  const validPlatforms = (platforms ?? []).filter(
    (p): p is string => !!p && !!PLATFORM_INFO[p] && !!process.env[PLATFORM_INFO[p].affiliateEnv]
  );
  if (validPlatforms.length === 0) return null;

  return (
    <div className="border border-line rounded-card overflow-hidden">
      <div className="bg-paper-soft px-3 py-1 flex items-center gap-2">
        <span className="text-xs font-bold text-ink-soft bg-line px-1.5 py-0.5 rounded">PR</span>
        <span className="text-xs text-ink-muted">このリンクはアフィリエイト広告を含みます</span>
      </div>
      <div className="bg-paper-soft p-4 space-y-2">
        <p className="text-xs text-ink-muted">配信中のサービス</p>
        <div className="flex flex-wrap gap-2">
          {validPlatforms.map((platform) => {
            const info = PLATFORM_INFO[platform];
            const affiliateUrl = process.env[info.affiliateEnv];
            const url = affiliateUrl || info.serviceUrl;
            return (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className={`${info.bgColor} text-white px-4 py-2 rounded-card text-sm font-medium hover:opacity-90 transition-opacity`}
              >
                {info.label} で観る →
              </a>
            );
          })}
        </div>

        {validPlatforms.includes("hulu") && process.env.AFFILIATE_URL_HULU && (
          <div className="inline-block">
            <a
              href={process.env.AFFILIATE_URL_HULU}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HULU_BANNER.imgSrc}
                width={HULU_BANNER.width}
                height={HULU_BANNER.height}
                alt={HULU_BANNER.alt}
                className="border-0"
              />
            </a>
            {/* 成果計測用の計測タグ（クリックとは独立した表示計測ピクセル）。afbの提供コード通り<a>の外に置く */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={HULU_BANNER.pixelSrc} width={1} height={1} alt="" className="border-0" />
          </div>
        )}
      </div>
    </div>
  );
}
