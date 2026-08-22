import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { works, episodes } from "@kansou/db";
import { eq } from "drizzle-orm";

const BASE_URL = "https://kansou-web-dzqj.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allWorks = await db.select().from(works);

  const workUrls = allWorks.map((work) => ({
    url: `${BASE_URL}/works/${work.slug}`,
    lastModified: work.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const episodeUrls = (
    await Promise.all(
      allWorks.map(async (work) => {
        const eps = await db
          .select()
          .from(episodes)
          .where(eq(episodes.workId, work.id));
        return eps.map((ep) => ({
          url: `${BASE_URL}/works/${work.slug}/episodes/${ep.episodeNumber}`,
          lastModified: ep.createdAt,
          changeFrequency: "daily" as const,
          priority: 0.6,
        }));
      })
    )
  ).flat();

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...workUrls,
    ...episodeUrls,
  ];
}
