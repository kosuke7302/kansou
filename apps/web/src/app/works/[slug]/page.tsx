import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { works, episodes, comments } from "@kansou/db";
import { eq, asc, count, countDistinct, isNull, isNotNull, and } from "drizzle-orm";
import { StreamingBanner } from "@/app/_components/streaming-banner";
import { PaginationNav } from "@/app/_components/pagination-nav";
import { FavoriteButton } from "@/app/_components/favorite-button";

const PAGE_SIZE = 200;

type EpisodeRow = {
  id: number;
  episodeNumber: number | null;
  volumeNumber: number | null;
  title: string | null;
  commentCount: number;
};

type Tab = "episode" | "volume" | "commented";

function buildHref(
  slug: string,
  params: { epPage?: number; volPage?: number; tab?: Tab }
) {
  const usp = new URLSearchParams();
  if (params.tab && params.tab !== "episode") usp.set("tab", params.tab);
  if (params.epPage && params.epPage > 1) usp.set("epPage", String(params.epPage));
  if (params.volPage && params.volPage > 1) usp.set("volPage", String(params.volPage));
  const qs = usp.toString();
  return `/works/${slug}${qs ? `?${qs}` : ""}`;
}

const TYPE_LABELS: Record<string, string> = {
  anime: "アニメ", manga: "漫画", drama: "ドラマ", movie: "映画",
};
const TYPE_STYLES: Record<string, string> = {
  anime: "bg-purple-100 text-purple-700",
  manga: "bg-blue-100 text-blue-700",
  drama: "bg-green-100 text-green-700",
  movie: "bg-orange-100 text-orange-700",
};

const BASE_URL = "https://www.kansou-log.com";

export async function generateMetadata({ params }: PageProps<"/works/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [work] = await db.select().from(works).where(eq(works.slug, slug)).limit(1);
  if (!work) return {};
  const title = `${work.title} 感想`;
  const description = `${work.title}の話数ごとの感想・レビュー・考察まとめ。ネタバレあり。`;
  const url = `${BASE_URL}/works/${slug}`;
  return {
    title,
    description,
    openGraph: { type: "article", title, description, url, siteName: "感想ログ", locale: "ja_JP" },
    twitter: { card: "summary", title, description },
    alternates: { canonical: url },
  };
}

export default async function WorkPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ epPage?: string; volPage?: string; tab?: string }>;
}) {
  const { slug } = await params;
  const { epPage: epPageRaw, volPage: volPageRaw, tab: tabRaw } = await searchParams;
  const epPage = Math.max(1, Number(epPageRaw) || 1);
  const volPage = Math.max(1, Number(volPageRaw) || 1);

  const [work] = await db.select().from(works).where(eq(works.slug, slug)).limit(1);
  if (!work) notFound();

  const isManga = work.type === "manga";
  const isMovie = work.type === "movie";
  const tab: Tab =
    tabRaw === "commented" ? "commented" : isManga && tabRaw === "volume" ? "volume" : "episode";

  const episodeCols = {
    id: episodes.id,
    episodeNumber: episodes.episodeNumber,
    volumeNumber: episodes.volumeNumber,
    title: episodes.title,
    commentCount: count(comments.id),
  };

  const pagedEpisodesQuery = db
    .select(episodeCols)
    .from(episodes)
    .leftJoin(comments, eq(comments.episodeId, episodes.id))
    .where(and(eq(episodes.workId, work.id), isNotNull(episodes.episodeNumber)))
    .groupBy(episodes.id, episodes.episodeNumber, episodes.volumeNumber, episodes.title)
    .orderBy(asc(episodes.episodeNumber))
    .limit(PAGE_SIZE)
    .offset((epPage - 1) * PAGE_SIZE);

  const pagedVolumesQuery = db
    .select(episodeCols)
    .from(episodes)
    .leftJoin(comments, eq(comments.episodeId, episodes.id))
    .where(and(eq(episodes.workId, work.id), isNull(episodes.episodeNumber)))
    .groupBy(episodes.id, episodes.episodeNumber, episodes.volumeNumber, episodes.title)
    .orderBy(asc(episodes.volumeNumber))
    .limit(PAGE_SIZE)
    .offset((volPage - 1) * PAGE_SIZE);

  const commentedQuery = db
    .select(episodeCols)
    .from(episodes)
    .innerJoin(comments, eq(comments.episodeId, episodes.id))
    .where(eq(episodes.workId, work.id))
    .groupBy(episodes.id, episodes.episodeNumber, episodes.volumeNumber, episodes.title)
    .orderBy(asc(episodes.volumeNumber), asc(episodes.episodeNumber))
    .limit(PAGE_SIZE);

  const [
    [{ workCommentCount }],
    [{ episodeTotal }],
    [{ volumeTotal }],
    [{ commentedTotal }],
    pagedEpisodes,
    pagedVolumes,
    commentedEpisodes,
  ] = await Promise.all([
    db.select({ workCommentCount: count(comments.id) }).from(comments)
      .where(and(eq(comments.workId, work.id), isNull(comments.episodeId))),
    db.select({ episodeTotal: count() }).from(episodes)
      .where(and(eq(episodes.workId, work.id), isNotNull(episodes.episodeNumber))),
    isManga
      ? db.select({ volumeTotal: count() }).from(episodes)
          .where(and(eq(episodes.workId, work.id), isNull(episodes.episodeNumber)))
      : Promise.resolve([{ volumeTotal: 0 }]),
    db.select({ commentedTotal: countDistinct(episodes.id) }).from(episodes)
      .innerJoin(comments, eq(comments.episodeId, episodes.id))
      .where(eq(episodes.workId, work.id)),
    tab === "episode" ? pagedEpisodesQuery : Promise.resolve([] as EpisodeRow[]),
    isManga && tab === "volume" ? pagedVolumesQuery : Promise.resolve([] as EpisodeRow[]),
    tab === "commented" ? commentedQuery : Promise.resolve([] as EpisodeRow[]),
  ]);

  const epTotalPages = Math.max(1, Math.ceil(Number(episodeTotal) / PAGE_SIZE));
  const volTotalPages = Math.max(1, Math.ceil(Number(volumeTotal) / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-indigo-500 hover:underline">← 作品一覧</Link>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[work.type]}`}>
            {TYPE_LABELS[work.type]}
          </span>
          <h1 className="text-2xl font-bold">{work.title}</h1>
          <FavoriteButton workId={work.id} slug={slug} />
        </div>
        {work.description && (
          <p className="text-gray-500 text-sm mt-1">{work.description}</p>
        )}
      </div>

      {/* 作品全体の感想へのリンク */}
      <Link
        href={`/works/${slug}/reviews`}
        className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 hover:bg-amber-100 transition-colors"
      >
        <div>
          <p className="text-sm font-semibold text-amber-800">作品全体の感想・レビュー</p>
          <p className="text-xs text-amber-600 mt-0.5">完読・完走済みの方の感想まとめ（ネタバレ注意）</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {Number(workCommentCount) > 0 && (
            <span className="text-sm font-bold text-amber-700">{workCommentCount}件</span>
          )}
          <span className="text-amber-600 text-lg">→</span>
        </div>
      </Link>

      <StreamingBanner platforms={work.platforms} />

      {isManga ? (
        <section>
          {/* 話／巻／コメントありタブ */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <Link
              href={buildHref(slug, { tab: "episode", epPage, volPage })}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === "episode" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              話（{episodeTotal}）
            </Link>
            <Link
              href={buildHref(slug, { tab: "volume", epPage, volPage })}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === "volume" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              巻（{volumeTotal}）
            </Link>
            <Link
              href={buildHref(slug, { tab: "commented", epPage, volPage })}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === "commented" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              💬コメントあり（{commentedTotal}）
            </Link>
          </div>

          {tab === "commented" ? (
            commentedEpisodes.length === 0 ? (
              <p className="text-gray-400 text-sm">まだコメントがありません</p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {commentedEpisodes.map((ep) => (
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
                    <span className="text-xs text-indigo-500 font-medium">💬{ep.commentCount}</span>
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
                      {Number(vol.commentCount) > 0 && (
                        <span className="text-xs text-indigo-500 font-medium">💬{vol.commentCount}</span>
                      )}
                    </Link>
                  ))}
                </div>
                <PaginationNav
                  page={volPage}
                  totalPages={volTotalPages}
                  hrefFor={(p) => buildHref(slug, { tab: "volume", epPage, volPage: p })}
                />
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
                    {Number(ep.commentCount) > 0 && (
                      <span className="text-indigo-500 font-medium">💬{ep.commentCount}</span>
                    )}
                  </Link>
                ))}
              </div>
              <PaginationNav
                page={epPage}
                totalPages={epTotalPages}
                hrefFor={(p) => buildHref(slug, { tab: "episode", epPage: p, volPage })}
              />
            </>
          )}
        </section>
      ) : (
        <section>
          {isMovie ? (
            <h2 className="text-lg font-semibold mb-3">作品</h2>
          ) : (
            <div className="flex gap-2 mb-3 flex-wrap">
              <Link
                href={buildHref(slug, { tab: "episode", epPage })}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  tab === "episode" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600"
                }`}
              >
                話数一覧（{episodeTotal}）
              </Link>
              <Link
                href={buildHref(slug, { tab: "commented", epPage })}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  tab === "commented" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600"
                }`}
              >
                💬コメントあり（{commentedTotal}）
              </Link>
            </div>
          )}

          {tab === "commented" && !isMovie ? (
            commentedEpisodes.length === 0 ? (
              <p className="text-gray-400 text-sm">まだコメントがありません</p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {commentedEpisodes.map((ep) => (
                  <Link
                    key={ep.id}
                    href={`/works/${slug}/episodes/${ep.episodeNumber}`}
                    title={ep.title ?? undefined}
                    className="relative flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg py-2 text-sm hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                  >
                    <span>第{ep.episodeNumber}話</span>
                    <span className="text-xs text-indigo-500 font-medium">💬{ep.commentCount}</span>
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
                    {Number(ep.commentCount) > 0 && (
                      <span className="text-xs text-indigo-500 font-medium">💬{ep.commentCount}</span>
                    )}
                  </Link>
                ))}
              </div>
              <PaginationNav page={epPage} totalPages={epTotalPages} hrefFor={(p) => buildHref(slug, { epPage: p })} />
            </>
          )}
        </section>
      )}
    </div>
  );
}
