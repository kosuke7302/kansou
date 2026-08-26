"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export function HeaderAuth() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  if (status === "loading") {
    return <div className="w-8 h-8 shrink-0" />;
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
    <div className="relative shrink-0">
      <button
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="アカウントメニュー"
        className="block"
      >
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt=""
            className="w-8 h-8 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-medium">
            {session.user.name?.[0] ?? "?"}
          </div>
        )}
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
            <Link
              href="/favorites"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              お気に入り
            </Link>
            <Link
              href="/my-comments"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              マイコメント
            </Link>
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              アカウント設定
            </Link>
            <button
              onClick={() => {
                setMenuOpen(false);
                signOut();
              }}
              className="block w-full text-left px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 border-t border-gray-100"
            >
              ログアウト
            </button>
          </div>
        </>
      )}
    </div>
  );
}
