"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LikeButton } from "./like-button";
import { postComment, postWorkComment } from "@/app/actions/comments";

const NICKNAME_KEY = "kansou_nickname";

export type CommentItem = {
  id: number;
  authorName: string;
  body: string;
  imageUrl: string | null;
  createdAt: string | Date;
  likeCount: number;
  parentId: number | null;
};

type ThreadProps = {
  slug: string;
  episodeNumber?: number;
  volumeNumber?: number;
  comments: CommentItem[];
};

function ReplyForm({
  slug,
  episodeNumber,
  volumeNumber,
  parentId,
  onDone,
}: {
  slug: string;
  episodeNumber?: number;
  volumeNumber?: number;
  parentId: number;
  onDone: () => void;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(NICKNAME_KEY);
    if (saved) setNickname(saved);
    else if (session?.user?.name) setNickname(session.user.name);
  }, [session?.user?.name]);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const isWorkLevel = episodeNumber === undefined && volumeNumber === undefined;
      const res = isWorkLevel
        ? await postWorkComment({}, formData)
        : await postComment({}, formData);
      if (res.error) {
        setError(res.error);
      } else {
        router.refresh();
        onDone();
      }
    });
  }

  return (
    <form action={handleSubmit} className="mt-2 ml-4 pl-3 border-l-2 border-gray-100 space-y-2">
      <input type="hidden" name="slug" value={slug} />
      {episodeNumber !== undefined && <input type="hidden" name="episodeNumber" value={episodeNumber} />}
      {volumeNumber !== undefined && <input type="hidden" name="volumeNumber" value={volumeNumber} />}
      <input type="hidden" name="parentId" value={parentId} />
      {error && <p className="text-xs text-red-500 bg-red-50 rounded px-2 py-1">{error}</p>}
      <input
        name="authorName"
        value={nickname}
        onChange={(e) => {
          setNickname(e.target.value);
          localStorage.setItem(NICKNAME_KEY, e.target.value);
        }}
        placeholder="ニックネーム（省略可）"
        maxLength={100}
        disabled={isPending}
        className="w-full text-base border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
      />
      <textarea
        name="body"
        required
        rows={2}
        maxLength={1000}
        placeholder="返信を書く"
        disabled={isPending}
        className="w-full text-base border border-gray-200 rounded-lg px-2.5 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? "送信中..." : "返信する"}
        </button>
        <button type="button" onClick={onDone} className="text-xs text-gray-400 hover:text-gray-600">
          キャンセル
        </button>
      </div>
    </form>
  );
}

function CommentRow({ comment }: { comment: CommentItem }) {
  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">{comment.authorName}</span>
          <span className="text-xs text-gray-400">
            {new Date(comment.createdAt).toLocaleDateString("ja-JP")}
          </span>
        </div>
        <LikeButton commentId={comment.id} initialCount={comment.likeCount} />
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.body}</p>
      {comment.imageUrl && (
        <a href={comment.imageUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={comment.imageUrl}
            alt="添付画像"
            className="max-h-64 rounded-lg border border-gray-200 object-contain"
          />
        </a>
      )}
    </>
  );
}

type SortOrder = "newest" | "oldest" | "likes";

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "oldest", label: "古い順" },
  { value: "newest", label: "新しい順" },
  { value: "likes", label: "いいね順" },
];

function sortComments(list: CommentItem[], order: SortOrder): CommentItem[] {
  const sorted = [...list];
  if (order === "newest") {
    sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (order === "likes") {
    sorted.sort((a, b) => b.likeCount - a.likeCount);
  } else {
    sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  return sorted;
}

export function CommentThread({ slug, episodeNumber, volumeNumber, comments }: ThreadProps) {
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("oldest");

  const topLevel = sortComments(
    comments.filter((c) => c.parentId === null),
    sortOrder
  );
  const repliesByParent = new Map<number, CommentItem[]>();
  for (const c of comments) {
    if (c.parentId !== null) {
      const arr = repliesByParent.get(c.parentId) ?? [];
      arr.push(c);
      repliesByParent.set(c.parentId, arr);
    }
  }

  return (
    <>
      <div className="flex justify-end mb-2">
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {topLevel.map((comment) => (
        <div key={comment.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3">
          <CommentRow comment={comment} />

          <button
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            className="text-xs text-indigo-500 hover:underline mt-1.5"
          >
            {replyingTo === comment.id ? "キャンセル" : "返信する"}
          </button>

          {(repliesByParent.get(comment.id) ?? []).map((reply) => (
            <div key={reply.id} className="mt-2 ml-4 pl-3 border-l-2 border-gray-100">
              <CommentRow comment={reply} />
            </div>
          ))}

          {replyingTo === comment.id && (
            <ReplyForm
              slug={slug}
              episodeNumber={episodeNumber}
              volumeNumber={volumeNumber}
              parentId={comment.id}
              onDone={() => setReplyingTo(null)}
            />
          )}
        </div>
      ))}
    </>
  );
}
