import Link from "next/link";
import { logout } from "@/app/actions/admin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <nav className="flex items-center gap-6">
          <span className="font-bold text-indigo-600">管理画面</span>
          <Link href="/admin/works" className="text-sm text-gray-600 hover:text-indigo-600">作品一覧</Link>
          <Link href="/admin/works/new" className="text-sm text-gray-600 hover:text-indigo-600">作品追加</Link>
          <Link href="/admin/requests" className="text-sm text-gray-600 hover:text-indigo-600">作品リクエスト</Link>
          <Link href="/admin/comments" className="text-sm text-gray-600 hover:text-indigo-600">コメント管理</Link>
          <Link href="/admin/contact" className="text-sm text-gray-600 hover:text-indigo-600">お問い合わせ</Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← サイトへ</Link>
        </nav>
        <form action={logout}>
          <button type="submit" className="text-xs text-gray-400 hover:text-gray-600">ログアウト</button>
        </form>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
