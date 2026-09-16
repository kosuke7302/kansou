"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { ImageAttach, type ImageAttachHandle } from "./image-attach";
import { postComment, type CommentActionState } from "@/app/actions/comments";
import { trackEvent } from "@/lib/gtag";

const NICKNAME_KEY = "kansou_nickname";
const initialState: CommentActionState = {};

type Props = {
  slug: string;
  workId: number;
  workTitle: string;
  episodeId: number;
} & (
  | { episodeNumber: number; volumeNumber?: never }
  | { volumeNumber: number; episodeNumber?: never }
);

export function CommentForm({ slug, workId, workTitle, episodeId, episodeNumber, volumeNumber }: Props) {
  const [state, action, pending] = useActionState(postComment, initialState);
  const [nickname, setNickname] = useState("名前未設定");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageAttachRef = useRef<ImageAttachHandle>(null);
  const { data: session, status } = useSession();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  // GA4ファネル計測（クリック・入力開始は同一ページ内で1回のみ発火）
  const hasFiredClickRef = useRef(false);
  const hasFiredStartRef = useRef(false);

  const spoilerLabel = episodeNumber !== undefined ? `第${episodeNumber}話` : `第${volumeNumber}巻`;

  const eventParams = {
    work_id: workId,
    work_title: workTitle,
    episode_id: episodeId,
    episode_number: episodeNumber ?? null,
    ...(volumeNumber !== undefined && { volume_number: volumeNumber }),
  };

  useEffect(() => {
    const saved = localStorage.getItem(NICKNAME_KEY);
    if (saved) setNickname(saved);
    else if (session?.user?.name) setNickname(session.user.name);
  }, [session?.user?.name]);

  useEffect(() => {
    if (state.success) {
      trackEvent("comment_submit", eventParams);
      if (textareaRef.current) textareaRef.current.value = "";
      imageAttachRef.current?.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  function handleNicknameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNickname(e.target.value);
    localStorage.setItem(NICKNAME_KEY, e.target.value);
  }

  function handleTextareaFocus() {
    if (hasFiredClickRef.current) return;
    hasFiredClickRef.current = true;
    trackEvent("comment_input_click", eventParams);
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (hasFiredStartRef.current || e.target.value.length === 0) return;
    hasFiredStartRef.current = true;
    trackEvent("comment_input_start");
  }

  return (
    <section id="comment-form" className="max-sm:hidden bg-white border border-gray-200 rounded-lg p-4">
      <h2 className="text-sm font-semibold">💬 今回の感想を一言</h2>
      <p className="text-xs text-gray-400 mt-0.5 mb-3">
        「○○最高」「ここ意味わからん」だけでもOK！放送前の考察・予想も歓迎です。運営が全部読んで返信します。初めての投稿には🔰「初コメント」バッジが付きます。
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
          <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
            {state.isFirstComment ? "🔰投稿しました！「初コメント」バッジ獲得です！" : "投稿しました！"}
          </p>
        )}

        <input
          name="authorName"
          value={nickname}
          onChange={handleNicknameChange}
          placeholder="ニックネーム（省略可）"
          maxLength={100}
          className="w-full text-base border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
          disabled={pending}
        />
        <textarea
          ref={textareaRef}
          name="body"
          placeholder="感想を書く..."
          rows={4}
          maxLength={1000}
          required
          onFocus={handleTextareaFocus}
          onChange={handleTextareaChange}
          className="w-full text-base border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
          disabled={pending}
        />

        <ImageAttach
          ref={imageAttachRef}
          imageUrl={imageUrl}
          onChange={setImageUrl}
          onUploadingChange={setImageUploading}
          disabled={pending}
        />

        <button
          type="submit"
          disabled={pending || imageUploading}
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {pending ? "投稿中..." : imageUploading ? "画像アップロード中..." : "投稿する"}
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
