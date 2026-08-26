"use client";

import { signIn } from "next-auth/react";

export function LoginPrompt({ message }: { message: string }) {
  return (
    <div className="text-center py-16 space-y-4">
      <p className="text-gray-500 text-sm">{message}</p>
      <button
        onClick={() => signIn("google")}
        className="bg-indigo-600 text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Googleでログイン
      </button>
    </div>
  );
}
