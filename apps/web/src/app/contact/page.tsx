import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "感想ログへのお問い合わせはこちらから。",
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div>
        <Link href="/" className="text-sm text-indigo-500 hover:underline">← トップへ戻る</Link>
        <h1 className="text-2xl font-bold mt-3">お問い合わせ</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <p className="text-sm text-gray-700 leading-relaxed">
          感想ログに関するお問い合わせ（不適切なコンテンツの報告、掲載作品のリクエスト、その他のご意見）は、
          以下のメールアドレスにてお受けしています。
        </p>
        <div className="bg-gray-50 rounded-lg px-4 py-3">
          <p className="text-xs text-gray-500 mb-1">メールアドレス</p>
          <a
            href="mailto:rimota7302@gmail.com"
            className="text-indigo-600 font-medium hover:underline text-sm"
          >
            rimota7302@gmail.com
          </a>
        </div>
        <p className="text-xs text-gray-500">
          ※ お問い合わせ内容によっては返信できない場合や、返信にお時間をいただく場合があります。
        </p>
      </div>

      <div className="text-sm text-gray-500 space-y-1">
        <p>
          <Link href="/privacy-policy" className="text-indigo-500 hover:underline">プライバシーポリシー</Link>
          {" "}もご確認ください。
        </p>
      </div>
    </div>
  );
}
