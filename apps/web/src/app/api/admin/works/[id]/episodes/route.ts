import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { works, episodes } from "@kansou/db";
import { eq, and, isNull, isNotNull, or, ilike, asc, count, sql } from "drizzle-orm";

const PAGE_SIZE = 50;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const jar = await cookies();
  if (jar.get("admin_session")?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const workId = Number(id);
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const q = url.searchParams.get("q")?.trim() ?? "";
  const kind = url.searchParams.get("kind") ?? "all"; // "all" | "volume" | "chapter"

  const [work] = await db.select({ type: works.type }).from(works).where(eq(works.id, workId)).limit(1);
  if (!work) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let kindCondition;
  if (kind === "volume") kindCondition = isNull(episodes.episodeNumber);
  else if (kind === "chapter") kindCondition = isNotNull(episodes.episodeNumber);
  else kindCondition = undefined;

  const baseWhere = and(
    eq(episodes.workId, workId),
    kindCondition,
    q ? or(
      ilike(episodes.title, `%${q}%`),
      sql`CAST(${episodes.episodeNumber} AS TEXT) ILIKE ${`%${q}%`}`,
      sql`CAST(${episodes.volumeNumber} AS TEXT) ILIKE ${`%${q}%`}`,
    ) : undefined,
  );

  const [{ total }] = await db.select({ total: count() }).from(episodes).where(baseWhere);
  const rows = await db.select({
    id: episodes.id,
    episodeNumber: episodes.episodeNumber,
    volumeNumber: episodes.volumeNumber,
    title: episodes.title,
  })
    .from(episodes)
    .where(baseWhere)
    .orderBy(asc(episodes.volumeNumber), asc(episodes.episodeNumber))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  return NextResponse.json({
    episodes: rows,
    total: Number(total),
    pages: Math.ceil(Number(total) / PAGE_SIZE),
    page,
    workType: work.type,
  });
}
