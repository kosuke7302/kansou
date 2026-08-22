import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "感想ログ | アニメ・漫画・ドラマの話数別感想サイト",
    template: "%s | 感想ログ",
  },
  description:
    "アニメ・漫画・ドラマ・映画の話数ごとに感想を投稿・閲覧できるコミュニティサイト。「〇〇 感想」の決定版。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased`}>
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
          {/* Google AdSense placeholder */}
          <div className="h-16 flex items-center justify-center bg-gray-100 text-sm text-gray-400">
            広告スペース
          </div>
          <div className="max-w-4xl mx-auto px-4 py-4 text-center text-xs text-gray-400">
            © 2025 感想ログ
          </div>
        </footer>
      </body>
    </html>
  );
}
