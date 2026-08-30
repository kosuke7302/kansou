import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
            width: 96,
            height: 72,
            background: "white",
            borderRadius: 20,
            position: "relative",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 24,
              height: 24,
              background: "white",
              bottom: -10,
              left: 28,
              transform: "rotate(45deg)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            color: "white",
            fontWeight: 800,
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          感想ログ
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
          アニメ・漫画・ドラマの話数別感想サイト
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
