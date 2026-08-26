"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export function HeaderAuth() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-20 h-8 shrink-0" />;
  }

  if (!session?.user) {
    return (
      <button
        onClick={() => signIn("google")}
        title="ログインすると、お気に入り登録・コメント履歴の確認・ニックネームの保存ができます"
        className="shrink-0 text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors"
      >
        ログイン
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 shrink-0">
      <Link href="/favorites" className="text-xs text-gray-500 hover:text-indigo-600 whitespace-nowrap">
        お気に入り
      </Link>
      <Link href="/my-comments" className="text-xs text-gray-500 hover:text-indigo-600 whitespace-nowrap">
        マイコメント
      </Link>
      <Link href="/account" title="アカウント設定">
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={session.user.image} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <span className="text-xs text-gray-500 hover:text-indigo-600">設定</span>
        )}
      </Link>
      <button
        onClick={() => signOut()}
        className="text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap"
      >
        ログアウト
      </button>
    </div>
  );
}
