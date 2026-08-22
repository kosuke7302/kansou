import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用規約",
  description: "感想ログの利用規約です。",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <div>
        <Link href="/" className="text-sm text-indigo-500 hover:underline">← トップへ戻る</Link>
        <h1 className="text-2xl font-bold mt-3">利用規約</h1>
        <p className="text-sm text-gray-500 mt-1">最終更新日：2025年1月1日</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">第1条（適用）</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          本規約は、感想ログ（以下「当サイト」）の利用条件を定めるものです。
          当サイトを利用するすべてのユーザーに適用されます。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">第2条（投稿コンテンツ）</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          ユーザーが投稿した感想・コメント（以下「投稿コンテンツ」）について、
          当サイトはサービス提供・改善のために利用することができるものとします。
          ユーザーは投稿コンテンツに関する適切な権利を有していることを保証するものとします。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">第3条（禁止事項）</h2>
        <p className="text-sm text-gray-700 leading-relaxed">ユーザーは以下の行為を行ってはなりません。</p>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside leading-relaxed">
          <li>法令または公序良俗に違反する行為</li>
          <li>他者を誹謗中傷する行為</li>
          <li>スパム・宣伝目的の投稿</li>
          <li>第三者の著作権・肖像権等を侵害する行為</li>
          <li>当サイトの運営を妨害する行為</li>
          <li>その他、当サイトが不適切と判断する行為</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">第4条（投稿コンテンツの削除）</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          当サイトは、投稿コンテンツが本規約に違反すると判断した場合、
          事前の通知なく当該コンテンツを削除することができます。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">第5条（免責事項）</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          当サイトは、ユーザーが投稿したコンテンツの内容について一切の責任を負いません。
          当サイトの利用によって生じた損害について、当サイトは一切の責任を負いません。
          当サイトは、予告なくサービスの内容変更・終了を行う場合があります。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">第6条（規約の変更）</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          当サイトは、必要に応じて本規約を変更することがあります。
          変更後の規約は本ページに掲載した時点で効力を生じるものとします。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">第7条（準拠法・管轄裁判所）</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          本規約の解釈にあたっては日本法を準拠法とし、
          当サイトに関して生じた紛争については東京地方裁判所を第一審の専属的合意管轄裁判所とします。
        </p>
      </section>
    </div>
  );
}
