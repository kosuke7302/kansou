"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/actions/admin";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-xl shadow p-8 w-80">
        <h1 className="text-lg font-bold mb-6 text-center">管理画面</h1>
        <form action={action} className="space-y-4">
          {state.error && (
            <p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2">{state.error}</p>
          )}
          <input
            name="password"
            type="password"
            placeholder="パスワード"
            required
            autoComplete="current-password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            disabled={pending}
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {pending ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}
