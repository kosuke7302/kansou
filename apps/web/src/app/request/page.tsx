import type { Metadata } from "next";
import Link from "next/link";
import { RequestForm } from "./request-form";

export const metadata: Metadata = {
  title: "作品をリクエストする",
  description: "感想ログに掲載してほしい作品をリクエストできます。",
};

export default async function RequestPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string }>;
}) {
  const { title } = await searchParams;
  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div>
        <Link href="/" className="text-sm text-indigo-500 hover:underline">← トップへ戻る</Link>
        <h1 className="text-2xl font-bold mt-3">作品をリクエストする</h1>
        <p className="text-sm text-gray-500 mt-1">
          「感想ログに載っていない作品」があれば、こちらからリクエストしてください。追加を検討します。
        </p>
        <Link href="/requests" className="inline-block text-sm text-indigo-500 hover:underline mt-2">
          これまでに追加された作品を見る →
        </Link>
      </div>

      <RequestForm defaultTitle={title ?? ""} />
    </div>
  );
}
