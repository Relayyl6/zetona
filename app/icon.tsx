import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 18,
          background: "#0A0A0A",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#F6F2E6",
          fontWeight: 900,
          fontFamily: "system-ui, sans-serif",
          borderRadius: "6px",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        Z
      </div>
    ),
    {
      ...size,
    }
  );
}
