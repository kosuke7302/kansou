import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { SessionProvider } from "next-auth/react";
import { HeaderAuth } from "./_components/header-auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
    "アニメ・漫画・ドラマ・映画の話数ごとに感想を投稿・閲覧できるコミュニティサイト。「〇〇 感想」の決定版。",
  verification: {
    google: "jCN8CuiJ0wWU6dpVCo1dd6hYXsWmBP9gAA_8SrQ9Di4",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "感想ログ",
    title: "感想ログ | アニメ・漫画・ドラマの話数別感想サイト",
    description:
      "アニメ・漫画・ドラマ・映画の話数ごとに感想を投稿・閲覧できるコミュニティサイト。「〇〇 感想」の決定版。",
  },
  twitter: {
    card: "summary",
    title: "感想ログ",
    description:
      "アニメ・漫画・ドラマ・映画の話数ごとに感想を投稿・閲覧できるコミュニティサイト。",
  },
};

const ADSENSE_CLIENT_ID = "ca-pub-7816910499406617";
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased`}>
      <head>
        {/* AdSense */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
        />
        {/* GA4 */}
        {GA4_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA4_ID}');`,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <SessionProvider>
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
              <a href="/" className="text-xl font-bold text-indigo-600 tracking-tight shrink-0">
                感想ログ
              </a>
              <form method="get" action="/search" className="flex-1 max-w-sm">
                <input
                  name="q"
                  type="search"
                  placeholder="作品を検索..."
                  className="w-full border border-gray-200 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </form>
              <HeaderAuth />
            </div>
          </header>

          <div className="bg-indigo-50 border-b border-indigo-100">
            <p className="max-w-4xl mx-auto px-4 py-1.5 text-center text-xs text-indigo-700">
              アニメ・漫画・ドラマ・映画の話数ごとに感想を投稿・閲覧できるサイト
            </p>
          </div>

          <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
            {children}
          </main>
        </SessionProvider>

        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-4xl mx-auto px-4 py-5">
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-3">
              <Link href="/request" className="text-xs text-gray-500 hover:text-indigo-500">
                作品をリクエスト
              </Link>
              <Link href="/privacy-policy" className="text-xs text-gray-500 hover:text-indigo-500">
                プライバシーポリシー
              </Link>
              <Link href="/terms" className="text-xs text-gray-500 hover:text-indigo-500">
                利用規約
              </Link>
              <Link href="/contact" className="text-xs text-gray-500 hover:text-indigo-500">
                お問い合わせ
              </Link>
            </nav>
            <p className="text-center text-xs text-gray-400">© {new Date().getFullYear()} 感想ログ</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
