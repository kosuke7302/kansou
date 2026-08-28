"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { postComment, type CommentActionState } from "@/app/actions/comments";

const NICKNAME_KEY = "kansou_nickname";
const initialState: CommentActionState = {};

type Props =
  | { slug: string; episodeNumber: number; volumeNumber?: never }
  | { slug: string; volumeNumber: number; episodeNumber?: never };

export function CommentForm({ slug, episodeNumber, volumeNumber }: Props) {
  const [state, action, pending] = useActionState(postComment, initialState);
  const [nickname, setNickname] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { data: session, status } = useSession();

  const spoilerLabel = episodeNumber !== undefined ? `第${episodeNumber}話` : `第${volumeNumber}巻`;

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
      <h2 className="text-sm font-semibold">💬 今回の感想を一言</h2>
      <p className="text-xs text-gray-400 mt-0.5 mb-3">
        「○○最高」「ここ意味わからん」だけでもOK！
      </p>
      <form action={action} className="space-y-3">
        <input type="hidden" name="slug" value={slug} />
        {episodeNumber !== undefined && (
          <input type="hidden" name="episodeNumber" value={episodeNumber} />
        )}
        {volumeNumber !== undefined && (
          <input type="hidden" name="volumeNumber" value={volumeNumber} />
        )}

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
          placeholder="感想を書く..."
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

        <div className="text-xs text-gray-400 space-y-0.5">
          <p>※ {spoilerLabel}までのネタバレOK</p>
          <p>※ 匿名で投稿できます</p>
          {status !== "authenticated" && status !== "loading" && (
            <p>
              <button type="button" onClick={() => signIn("google")} className="text-indigo-500 hover:underline">
                ログイン
              </button>
              すると、投稿した感想を後から見返せます
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
