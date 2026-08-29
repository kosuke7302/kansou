import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4f46e5",
        }}
      >
        <div
          style={{
            width: 108,
            height: 82,
            background: "white",
            borderRadius: 22,
            display: "flex",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 26,
              height: 26,
              background: "white",
              bottom: -10,
              left: 32,
              transform: "rotate(45deg)",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
