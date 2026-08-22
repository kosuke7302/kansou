import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "./contact-form";

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
        <p className="text-sm text-gray-500 mt-1">
          不適切なコンテンツの報告・掲載作品のリクエスト・その他のご意見はこちらからお送りください。
        </p>
      </div>

      <ContactForm />
    </div>
  );
}
