import type { Metadata, Viewport } from "next";
import { Zen_Old_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";
import { HeaderAuth } from "./_components/header-auth";
import "./globals.css";

const zenOldMincho = Zen_Old_Mincho({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-zen-old-mincho",
});
const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-zen-kaku-gothic-new",
});

const BASE_URL = "https://www.kansou-log.com";

export const viewport: Viewport = {
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "感想ログ | アニメ・漫画・ドラマの話数別感想サイト",
    template: "%s | 感想ログ",
  },
  description:
    "アニメ・漫画・ドラマ・映画の話数ごとに感想を投稿・閲覧できるコミュニティサイト。ログインすると、お気に入り作品や感想を後から見返せます。「〇〇 感想」の決定版。",
  verification: {
    google: "jCN8CuiJ0wWU6dpVCo1dd6hYXsWmBP9gAA_8SrQ9Di4",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "感想ログ",
    title: "感想ログ | アニメ・漫画・ドラマの話数別感想サイト",
    description:
      "アニメ・漫画・ドラマ・映画の話数ごとに感想を投稿・閲覧できるコミュニティサイト。ログインすると、お気に入り作品や感想を後から見返せます。",
  },
  twitter: {
    card: "summary_large_image",
    title: "感想ログ",
    description:
      "アニメ・漫画・ドラマ・映画の話数ごとに感想を投稿・閲覧。ログインすると、お気に入り作品や感想を後から見返せます。",
  },
};

const ADSENSE_CLIENT_ID = "ca-pub-7816910499406617";
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${zenOldMincho.variable} ${zenKakuGothicNew.variable} h-full antialiased`}>
      <head>
        {/* AdSense: 現状どのページも広告枠(slot)は空でまだ表示していないため、
            初期表示をブロックしないようlazyOnloadで読み込む（枠を設定すれば普通に動作する） */}
        <Script
          id="adsbygoogle-loader"
          strategy="lazyOnload"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
        />
        {/* GA4 */}
        {GA4_ID && (
          <>
            <Script id="ga4-loader" strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} />
            <Script
              id="ga4-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA4_ID}');`,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <SessionProvider>
          <header className="bg-white border-b border-line sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
              <a href="/" className="flex items-center h-full font-head text-xl font-bold text-accent-600 tracking-tight shrink-0">
                感想ログ
              </a>
              <form method="get" action="/search" className="flex-1 max-w-sm">
                <input
                  name="q"
                  type="search"
                  placeholder="作品を検索..."
                  className="w-full h-12 border border-line rounded-full px-4 text-base focus:outline-none focus:ring-2 focus:ring-accent-300"
                />
              </form>
              <HeaderAuth />
            </div>
          </header>

          <div className="bg-accent-50 border-b border-accent-100">
            <p className="max-w-4xl mx-auto px-4 py-1.5 text-center text-xs text-accent-700">
              先のネタバレを避けながら、同じ話を見た人の感想を楽しめます。ログインすると、お気に入り作品や自分の感想をあとから見返せます。
            </p>
          </div>

          <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
            {children}
          </main>
        </SessionProvider>

        <footer className="bg-white border-t border-line mt-auto">
          <div className="max-w-4xl mx-auto px-4 py-5">
            <nav className="flex flex-wrap justify-center gap-x-2 gap-y-1 mb-3">
              <Link href="/request" className="min-h-12 flex items-center px-3 text-xs text-ink-muted hover:text-accent-600">
                作品をリクエスト
              </Link>
              <Link href="/requests" className="min-h-12 flex items-center px-3 text-xs text-ink-muted hover:text-accent-600">
                追加されたリクエスト
              </Link>
              <Link href="/privacy-policy" className="min-h-12 flex items-center px-3 text-xs text-ink-muted hover:text-accent-600">
                プライバシーポリシー
              </Link>
              <Link href="/terms" className="min-h-12 flex items-center px-3 text-xs text-ink-muted hover:text-accent-600">
                利用規約
              </Link>
              <Link href="/contact" className="min-h-12 flex items-center px-3 text-xs text-ink-muted hover:text-accent-600">
                お問い合わせ
              </Link>
            </nav>
            <p className="text-center text-xs text-ink-muted">© {new Date().getFullYear()} 感想ログ</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
