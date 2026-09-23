"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type ImageAttachHandle = { reset: () => void };

type Props = {
  imageUrl: string | null;
  onChange: (url: string | null) => void;
  onUploadingChange?: (uploading: boolean) => void;
  disabled?: boolean;
};

// コメントへの画像添付フォーム部品。アップロード自体はブラウザ→Vercel Blobへ直接行い、
// 完了後のURLだけを隠しinput(name="imageUrl")として親フォームに含める。
export const ImageAttach = forwardRef<ImageAttachHandle, Props>(function ImageAttach(
  { imageUrl, onChange, onUploadingChange, disabled },
  ref
) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setPreviewUrl(null);
    setError(null);
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  useImperativeHandle(ref, () => ({ reset }));

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("jpg・png・webp・gifのみ添付できます");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("5MB以内の画像を選んでください");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    onUploadingChange?.(true);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/comment-image-upload",
      });
      onChange(blob.url);
    } catch {
      setError("画像のアップロードに失敗しました");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  }

  return (
    <div>
      <input type="hidden" name="imageUrl" value={imageUrl ?? ""} />

      {previewUrl ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="添付画像プレビュー" className="max-h-32 rounded-lg border border-gray-200" />
          {uploading && (
            <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs text-gray-500 rounded-lg">
              アップロード中...
            </span>
          )}
          <button
            type="button"
            onClick={reset}
            disabled={disabled}
            className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-700 text-white text-xs hover:bg-gray-900 disabled:opacity-50"
            aria-label="画像を削除"
          >
            ×
          </button>
        </div>
      ) : (
        <label className="inline-flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 cursor-pointer hover:border-indigo-300 w-fit">
          画像を添付
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />
        </label>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
});
