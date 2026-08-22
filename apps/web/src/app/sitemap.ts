import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { works, episodes } from "@kansou/db";
import { eq } from "drizzle-orm";

export const revalidate = 86400; // 24時間キャッシュ

const BASE_URL = "https://kansou-log.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [allWorks, allEpisodes] = await Promise.all([
    db.select({ slug: works.slug, createdAt: works.createdAt }).from(works),
    db
      .select({
        slug: works.slug,
        episodeNumber: episodes.episodeNumber,
        volumeNumber: episodes.volumeNumber,
        createdAt: episodes.createdAt,
      })
      .from(episodes)
      .innerJoin(works, eq(episodes.workId, works.id)),
  ]);

  const chapterUrls = allEpisodes
    .filter((ep) => ep.episodeNumber !== null)
    .map((ep) => ({
      url: `${BASE_URL}/works/${ep.slug}/episodes/${ep.episodeNumber}`,
      lastModified: ep.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  const volumeUrls = allEpisodes
    .filter((ep) => ep.episodeNumber === null && ep.volumeNumber !== null)
    .map((ep) => ({
      url: `${BASE_URL}/works/${ep.slug}/volumes/${ep.volumeNumber}`,
      lastModified: ep.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...allWorks.map((work) => ({
      url: `${BASE_URL}/works/${work.slug}`,
      lastModified: work.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...volumeUrls,
    ...chapterUrls,
  ];
}
