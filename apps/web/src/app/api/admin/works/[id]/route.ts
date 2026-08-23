import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { works, episodes } from "@kansou/db";
import { eq, count, and, isNull, isNotNull } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const jar = await cookies();
  const session = jar.get("admin_session")?.value;
  if (!session || session !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const workId = Number(id);

  const [work] = await db.select().from(works).where(eq(works.id, workId)).limit(1);
  if (!work) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [{ episodeCount }] = await db
    .select({ episodeCount: count(episodes.id) })
    .from(episodes)
    .where(and(eq(episodes.workId, workId), isNotNull(episodes.episodeNumber)));

  const [{ volumeCount }] = await db
    .select({ volumeCount: count(episodes.id) })
    .from(episodes)
    .where(and(eq(episodes.workId, workId), isNull(episodes.episodeNumber)));

  return NextResponse.json({
    ...work,
    episodeCount: Number(episodeCount),
    volumeCount: Number(volumeCount),
    chapterCount: Number(episodeCount),
  });
}
