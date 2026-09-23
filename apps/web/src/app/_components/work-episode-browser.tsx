"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const PAGE_SIZE = 200;

export type EpisodeRow = {
  id: number;
  episodeNumber: number | null;
  volumeNumber: number | null;
  title: string | null;
  commentCount: number;
};

type Tab = "episode" | "volume" | "commented";

function PageNav({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
    .reduce<(number | "…")[]>((acc, n, idx, arr) => {
      if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("…");
      acc.push(n);
      return acc;
    }, []);

  return (
    <div className="flex items-center justify-center gap-2 pt-3 flex-wrap">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:border-indigo-300 disabled:pointer-events-none disabled:opacity-40"
      >
        ← 前
      </button>
      {pages.map((item, idx) =>
        item === "…" ? (
          <span key={`e${idx}`} className="text-gray-400 text-sm px-1">…</span>
        ) : (
          <button
            type="button"
            key={item}
            onClick={() => onChange(item)}
            className={`w-8 h-8 flex items-center justify-center text-sm rounded-lg transition-colors ${
              page === item ? "bg-indigo-600 text-white" : "border border-gray-200 hover:border-indigo-300"
            }`}
          >
            {item}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:border-indigo-300 disabled:pointer-events-none disabled:opacity-40"
      >
        次 →
      </button>
    </div>
  );
}

type Props = {
  slug: string;
  isManga: boolean;
  isMovie: boolean;
  episodeTotal: number;
  volumeTotal: number;
  episodes: EpisodeRow[];
  volumes: EpisodeRow[];
};

function WorkEpisodeBrowserInner({ slug, isManga, isMovie, episodeTotal, volumeTotal, episodes, volumes }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabRaw = searchParams.get("tab");
  const initialTab: Tab =
    tabRaw === "commented" ? "commented" : isManga && tabRaw === "volume" ? "volume" : "episode";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [epPage, setEpPage] = useState(1);
  const [volPage, setVolPage] = useState(1);

  function changeTab(next: Tab) {
    setTab(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "episode") params.delete("tab");
    else params.set("tab", next);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const commented = useMemo(
    () =>
      [...episodes, ...volumes]
        .filter((e) => e.commentCount > 0)
        .sort(
          (a, b) =>
            (a.volumeNumber ?? 0) - (b.volumeNumber ?? 0) || (a.episodeNumber ?? 0) - (b.episodeNumber ?? 0)
        ),
    [episodes, volumes]
  );
  const commentedTotal = commented.length;

  const epTotalPages = Math.max(1, Math.ceil(episodes.length / PAGE_SIZE));
  const volTotalPages = Math.max(1, Math.ceil(volumes.length / PAGE_SIZE));
  const pagedEpisodes = episodes.slice((epPage - 1) * PAGE_SIZE, epPage * PAGE_SIZE);
  const pagedVolumes = volumes.slice((volPage - 1) * PAGE_SIZE, volPage * PAGE_SIZE);

  if (isManga) {
    return (
      <section>
        <div className="flex gap-2 mb-3 flex-wrap">
          <button
            type="button"
            onClick={() => changeTab("episode")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === "episode" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            話（{episodeTotal}）
          </button>
          <button
            type="button"
            onClick={() => changeTab("volume")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === "volume" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            巻（{volumeTotal}）
          </button>
          <button
            type="button"
            onClick={() => changeTab("commented")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === "commented" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            コメントあり（{commentedTotal}）
          </button>
        </div>

        {tab === "commented" ? (
          commented.length === 0 ? (
            <p className="text-gray-400 text-sm">まだコメントがありません</p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {commented.map((ep) => (
                <Link
                  key={ep.id}
                  href={
                    ep.volumeNumber != null
                      ? `/works/${slug}/volumes/${ep.volumeNumber}`
                      : `/works/${slug}/episodes/${ep.episodeNumber}`
                  }
                  title={ep.title ?? undefined}
                  className="relative flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg py-2 text-sm hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                >
                  <span>{ep.volumeNumber != null ? `第${ep.volumeNumber}巻` : `${ep.episodeNumber}話`}</span>
                  <span className="text-xs text-indigo-500 font-medium">{ep.commentCount}</span>
                </Link>
              ))}
            </div>
          )
        ) : tab === "volume" ? (
          pagedVolumes.length === 0 ? (
            <p className="text-gray-400 text-sm">データがありません</p>
          ) : (
            <>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {pagedVolumes.map((vol) => (
                  <Link
                    key={vol.id}
                    href={`/works/${slug}/volumes/${vol.volumeNumber}`}
                    className="relative flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg py-2 text-sm hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                  >
                    <span>第{vol.volumeNumber}巻</span>
                    {vol.commentCount > 0 && (
                      <span className="text-xs text-indigo-500 font-medium">{vol.commentCount}</span>
                    )}
                  </Link>
                ))}
              </div>
              <PageNav page={volPage} totalPages={volTotalPages} onChange={setVolPage} />
            </>
          )
        ) : pagedEpisodes.length === 0 ? (
          <p className="text-gray-400 text-sm">データがありません</p>
        ) : (
          <>
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
              {pagedEpisodes.map((ep) => (
                <Link
                  key={ep.id}
                  href={`/works/${slug}/episodes/${ep.episodeNumber}`}
                  title={ep.title ?? undefined}
                  className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg py-2 text-xs hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                >
                  <span>{ep.episodeNumber}話</span>
                  {ep.commentCount > 0 && (
                    <span className="text-indigo-500 font-medium">{ep.commentCount}</span>
                  )}
                </Link>
              ))}
            </div>
            <PageNav page={epPage} totalPages={epTotalPages} onChange={setEpPage} />
          </>
        )}
      </section>
    );
  }

  return (
    <section>
      {isMovie ? (
        <h2 className="text-lg font-semibold mb-3">作品</h2>
      ) : (
        <div className="flex gap-2 mb-3 flex-wrap">
          <button
            type="button"
            onClick={() => changeTab("episode")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === "episode" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            話数一覧（{episodeTotal}）
          </button>
          <button
            type="button"
            onClick={() => changeTab("commented")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === "commented" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            コメントあり（{commentedTotal}）
          </button>
        </div>
      )}

      {tab === "commented" && !isMovie ? (
        commented.length === 0 ? (
          <p className="text-gray-400 text-sm">まだコメントがありません</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {commented.map((ep) => (
              <Link
                key={ep.id}
                href={`/works/${slug}/episodes/${ep.episodeNumber}`}
                title={ep.title ?? undefined}
                className="relative flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg py-2 text-sm hover:border-indigo-300 hover:bg-indigo-50 transition-all"
              >
                <span>第{ep.episodeNumber}話</span>
                <span className="text-xs text-indigo-500 font-medium">{ep.commentCount}</span>
              </Link>
            ))}
          </div>
        )
      ) : pagedEpisodes.length === 0 ? (
        <p className="text-gray-400 text-sm">データがありません</p>
      ) : (
        <>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {pagedEpisodes.map((ep) => (
              <Link
                key={ep.id}
                href={`/works/${slug}/episodes/${ep.episodeNumber}`}
                title={ep.title ?? undefined}
                className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg py-2 text-sm hover:border-indigo-300 hover:bg-indigo-50 transition-all"
              >
                <span>{isMovie ? "本編" : `第${ep.episodeNumber}話`}</span>
                {ep.commentCount > 0 && (
                  <span className="text-xs text-indigo-500 font-medium">{ep.commentCount}</span>
                )}
              </Link>
            ))}
          </div>
          <PageNav page={epPage} totalPages={epTotalPages} onChange={setEpPage} />
        </>
      )}
    </section>
  );
}

// useSearchParams()を使うためSuspenseで包む（作品ページ自体はISRされたまま維持するため）
export function WorkEpisodeBrowser(props: Props) {
  return (
    <Suspense fallback={null}>
      <WorkEpisodeBrowserInner {...props} />
    </Suspense>
  );
}
