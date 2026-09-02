import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyticsCache, works } from "@kansou/db";
import { eq, sql } from "drizzle-orm";
import { fetchMonthlyPageViews, fetchTopPages } from "@/lib/ga4";

export const maxDuration = 30;

async function upsertCache(key: string, value: unknown) {
  await db
    .insert(analyticsCache)
    .values({ key, value: value as object, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: analyticsCache.key,
      set: { value: value as object, updatedAt: new Date() },
    });
}

// GA4のpagePath（例: /works/kinnikuman/episodes/543）から作品slug・タイトル・リンク先を解決
async function resolveTopPages(pages: { path: string; pageViews: number; activeUsers: number }[]) {
  const slugs = Array.from(
    new Set(
      pages
        .map((p) => p.path.match(/^\/works\/([^/]+)/)?.[1])
        .filter((s): s is string => !!s)
    )
  );
  if (slugs.length === 0) return [];

  const workRows = await db
    .select({ slug: works.slug, title: works.title })
    .from(works)
    .where(sql`${works.slug} = ANY(${slugs})`);
  const titleBySlug = new Map(workRows.map((w) => [w.slug, w.title]));

  return pages
    .map((p) => {
      const slug = p.path.match(/^\/works\/([^/]+)/)?.[1];
      if (!slug || !titleBySlug.has(slug)) return null;
      const epMatch = p.path.match(/\/episodes\/(\d+)/);
      const volMatch = p.path.match(/\/volumes\/(\d+)/);
      const label = epMatch ? `第${epMatch[1]}話` : volMatch ? `第${volMatch[1]}巻` : null;
      return {
        path: p.path,
        title: titleBySlug.get(slug)!,
        label,
        pageViews: p.pageViews,
        activeUsers: p.activeUsers,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [monthlyPageViews, topPagesRaw] = await Promise.all([
      fetchMonthlyPageViews(),
      fetchTopPages(10),
    ]);
    const topPages = await resolveTopPages(topPagesRaw);

    await Promise.all([
      upsertCache("monthly_pageviews", { count: monthlyPageViews }),
      upsertCache("top_pages_7d", { pages: topPages }),
    ]);

    return NextResponse.json({ ok: true, monthlyPageViews, topPagesCount: topPages.length });
  } catch (err) {
    console.error("GA4 sync failed:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
