import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { works } from "@kansou/db";
import { eq } from "drizzle-orm";

export const revalidate = 86400;
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string; episodeNumber: string }> };

export default async function OgImage({ params }: Props) {
  const { slug, episodeNumber } = await params;

  const [work] = await db.select({ title: works.title, type: works.type }).from(works).where(eq(works.slug, slug)).limit(1);

  const label = work?.type === "movie" ? "本編" : `第${episodeNumber}話`;
  const workTitle = work?.title ?? slug;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.15)",
            borderRadius: "12px",
            padding: "8px 20px",
            marginBottom: "32px",
          }}
        >
          <span style={{ fontSize: 24, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>
            感想ログ
          </span>
        </div>
        <div
          style={{
            fontSize: 56,
            color: "white",
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.3,
            marginBottom: "16px",
            maxWidth: "900px",
          }}
        >
          {workTitle}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 36,
            color: "rgba(255,255,255,0.85)",
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          {label} 感想・考察
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            fontSize: 20,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          kansou-log.com
        </div>
      </div>
    ),
    { ...size }
  );
}
