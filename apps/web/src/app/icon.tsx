import { ImageResponse } from "next/og";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 12,
        }}
      >
        <div
          style={{
            width: 30,
            height: 22,
            background: "white",
            borderRadius: 6,
            display: "flex",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 8,
              height: 8,
              background: "white",
              bottom: -3,
              left: 9,
              transform: "rotate(45deg)",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
