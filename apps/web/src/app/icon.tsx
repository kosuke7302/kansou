import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
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
          borderRadius: 8,
        }}
      >
        <div
          style={{
            width: 20,
            height: 15,
            background: "white",
            borderRadius: 4,
            display: "flex",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 5,
              height: 5,
              background: "white",
              bottom: -2,
              left: 6,
              transform: "rotate(45deg)",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
