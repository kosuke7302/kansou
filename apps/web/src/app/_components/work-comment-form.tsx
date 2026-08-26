"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { postWorkComment, type CommentActionState } from "@/app/actions/comments";

const NICKNAME_KEY = "kansou_nickname";
const initialState: CommentActionState = {};

export function WorkCommentForm({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState(postWorkComment, initialState);
  const [nickname, setNickname] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    const saved = localStorage.getItem(NICKNAME_KEY);
    if (saved) setNickname(saved);
    else if (session?.user?.name) setNickname(session.user.name);
  }, [session?.user?.name]);

  useEffect(() => {
    if (state.success && textareaRef.current) {
      textareaRef.current.value = "";
    }
  }, [state.success]);

  function handleNicknameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNickname(e.target.value);
    localStorage.setItem(NICKNAME_KEY, e.target.value);
  }

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-4">
      <h2 className="text-sm font-semibold mb-3">作品全体の感想を投稿する</h2>
      <form action={action} className="space-y-3">
        <input type="hidden" name="slug" value={slug} />

        {state.error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
        )}
        {state.success && (
          <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">投稿しました！</p>
        )}

        <input
          name="authorName"
          value={nickname}
          onChange={handleNicknameChange}
          placeholder="ニックネーム（省略可）"
          maxLength={100}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
          disabled={pending}
        />
        <textarea
          ref={textareaRef}
          name="body"
          placeholder="作品全体の感想・総評を書いてください（ネタバレ注意）"
          rows={4}
          maxLength={1000}
          required
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
          disabled={pending}
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {pending ? "投稿中..." : "投稿する"}
        </button>

        {status !== "authenticated" && status !== "loading" && (
          <p className="text-xs text-gray-400">
            <button type="button" onClick={() => signIn("google")} className="text-indigo-500 hover:underline">
              ログイン
            </button>
            すると、投稿した感想を後から見返せます
          </p>
        )}
      </form>
    </section>
  );
}
