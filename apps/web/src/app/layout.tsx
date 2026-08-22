import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const BASE_URL = "https://kansou-web-dzqj.vercel.app";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased`}>
      <head>
        {adsenseClientId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center">
            <a href="/" className="text-xl font-bold text-indigo-600 tracking-tight">
              感想ログ
            </a>
          </div>
        </header>

        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
          {children}
        </main>

        <footer className="bg-white border-t border-gray-200 mt-auto">
          {!adsenseClientId && (
            <div className="h-16 flex items-center justify-center bg-gray-100 text-sm text-gray-400">
              広告スペース（AdSense設定後に表示）
            </div>
          )}
          <div className="max-w-4xl mx-auto px-4 py-5">
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-3">
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
            <p className="text-center text-xs text-gray-400">© 2025 感想ログ</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
