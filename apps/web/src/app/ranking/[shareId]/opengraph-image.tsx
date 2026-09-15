import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { rankingProfiles, rankingEntries, works } from "@kansou/db";
import { eq, asc } from "drizzle-orm";

export const revalidate = 86400;
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ shareId: string }> };

export default async function OgImage({ params }: Props) {
  const { shareId } = await params;

  const [profile] = await db
    .select({ title: rankingProfiles.title })
    .from(rankingProfiles)
    .where(eq(rankingProfiles.shareId, shareId))
    .limit(1);

  const entries = await db
    .select({ position: rankingEntries.position, title: works.title })
    .from(rankingEntries)
    .innerJoin(works, eq(works.id, rankingEntries.workId))
    .innerJoin(rankingProfiles, eq(rankingProfiles.userId, rankingEntries.userId))
    .where(eq(rankingProfiles.shareId, shareId))
    .orderBy(asc(rankingEntries.position));

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          padding: "56px 64px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: "28px" }}>
          <span style={{ fontSize: 22, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
            感想ログ
          </span>
        </div>
        <div
          style={{
            fontSize: 40,
            color: "white",
            fontWeight: 800,
            marginBottom: "28px",
            maxWidth: "1000px",
          }}
        >
          {profile?.title ?? "私のアニメ・漫画ランキング"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {entries.map((e) => (
            <div key={e.position} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "48px",
                  height: "48px",
                  borderRadius: "9999px",
                  background: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: 24,
                  fontWeight: 800,
                  marginRight: "20px",
                  flexShrink: 0,
                }}
              >
                {e.position}
              </div>
              <div style={{ fontSize: 32, color: "white", fontWeight: 600 }}>{e.title}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
