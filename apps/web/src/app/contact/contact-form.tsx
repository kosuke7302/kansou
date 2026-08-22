"use client";

import { useActionState } from "react";
import { submitContact, type ContactActionState } from "@/app/actions/contact";

const initialState: ContactActionState = {};

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initialState);

  if (state.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-2">
        <p className="text-green-700 font-medium">お問い合わせを受け付けました</p>
        <p className="text-sm text-green-600">内容を確認のうえ、必要に応じてご連絡いたします。</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <form action={action} className="space-y-4">
        {state.error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
        )}

        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            お名前 <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={100}
            placeholder="例：田中 太郎"
            disabled={pending}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            メールアドレス
            <span className="text-gray-400 text-xs font-normal ml-1">（返信希望の場合）</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            maxLength={255}
            placeholder="例：example@email.com"
            disabled={pending}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="body" className="text-sm font-medium text-gray-700">
            お問い合わせ内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="body"
            name="body"
            required
            rows={6}
            minLength={10}
            maxLength={2000}
            placeholder="お問い合わせ内容をご記入ください"
            disabled={pending}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {pending ? "送信中..." : "送信する"}
        </button>
      </form>
    </div>
  );
}
