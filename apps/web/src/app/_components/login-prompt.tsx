"use client";

import { signIn } from "next-auth/react";

const BENEFITS = [
  "作品をお気に入り登録できる",
  "自分が書いたコメントを後から見返せる",
  "ニックネームを保存でき、投稿のたびに入力しなくて済む",
];

export function LoginPrompt({ message }: { message: string }) {
  return (
    <div className="text-center py-12 space-y-4">
      <p className="text-gray-600 text-sm font-medium">{message}</p>
      <ul className="inline-block text-left text-sm text-gray-500 space-y-1">
        {BENEFITS.map((b) => (
          <li key={b} className="flex items-start gap-1.5">
            <span className="text-indigo-500 shrink-0">✓</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div>
        <button
          onClick={() => signIn("google")}
          className="bg-indigo-600 text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Googleでログイン
        </button>
      </div>
    </div>
  );
}
