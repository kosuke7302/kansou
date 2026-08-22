import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "感想ログのプライバシーポリシーです。個人情報の取り扱い、Cookieの使用、広告配信について説明します。",
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <div>
        <Link href="/" className="text-sm text-indigo-500 hover:underline">← トップへ戻る</Link>
        <h1 className="text-2xl font-bold mt-3">プライバシーポリシー</h1>
        <p className="text-sm text-gray-500 mt-1">最終更新日：2025年1月1日</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">1. 基本方針</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          感想ログ（以下「当サイト」）は、ユーザーの個人情報の保護を重要な責務と考え、
          個人情報保護法その他の法令を遵守し、適切に取り扱います。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">2. 収集する情報</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          当サイトでは、感想コメントを投稿する際に入力されたニックネームおよびコメント本文を収集・保存します。
          メールアドレスやパスワードなどの個人識別情報は収集しません。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">3. Cookieの使用について</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          当サイトでは、サービス品質の向上および広告配信の最適化を目的として、Cookieを使用しています。
          ブラウザの設定からCookieを無効にすることができますが、一部機能が制限される場合があります。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">4. Google Analytics について</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          当サイトでは、アクセス解析のためにGoogle Analytics（Googleが提供するサービス）を使用しています。
          Google Analyticsはトラフィックデータの収集のためにCookieを使用しています。
          このデータは匿名で収集されており、個人を特定するものではありません。
          Google Analyticsのデータ収集を無効にする場合は、
          <a href="https://tools.google.com/dlpage/gaoptout" className="text-indigo-500 hover:underline" target="_blank" rel="noopener noreferrer">
            Google Analytics オプトアウト アドオン
          </a>
          をご利用ください。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">5. 広告配信について（Google AdSense）</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          当サイトでは、第三者配信の広告サービス「Google AdSense（グーグルアドセンス）」を利用しています。
          Google AdSenseでは、より適切な広告を表示するためにCookieを使用しています。
          Cookieを使用することで、当サイトやその他のサイトへのアクセス情報に基づいて広告が配信されます。
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          Googleによる広告のCookie使用に関する詳細は、
          <a href="https://policies.google.com/technologies/ads" className="text-indigo-500 hover:underline" target="_blank" rel="noopener noreferrer">
            Google の広告ポリシー
          </a>
          をご覧ください。
          パーソナライズ広告を無効にしたい場合は、
          <a href="https://www.google.com/settings/ads" className="text-indigo-500 hover:underline" target="_blank" rel="noopener noreferrer">
            広告設定ページ
          </a>
          からオプトアウトできます。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">6. 免責事項</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          当サイトのコンテンツ（感想・コメント）はユーザーが投稿したものであり、当サイトは内容の正確性・完全性を保証しません。
          ユーザーが投稿したコンテンツによって生じた損害について、当サイトは一切の責任を負いません。
          当サイトのコンテンツはネタバレを含む場合があります。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">7. 著作権について</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          当サイトに掲載されているアニメ・漫画・ドラマ・映画のタイトルおよびキャラクター等の著作権は、
          それぞれの権利者に帰属します。当サイトはこれらの非公式ファンサイトであり、
          各権利者との提携関係はありません。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">8. プライバシーポリシーの変更</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          当サイトは、必要に応じて本プライバシーポリシーを変更することがあります。
          変更後のポリシーは本ページに掲載した時点で効力を生じるものとします。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">9. お問い合わせ</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          本ポリシーに関するお問い合わせは、
          <Link href="/contact" className="text-indigo-500 hover:underline">お問い合わせページ</Link>
          よりご連絡ください。
        </p>
      </section>
    </div>
  );
}
