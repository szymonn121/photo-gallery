import { ImageResponse } from "next/og";

export const alt = "Autorska galeria fotografii";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #1a120f 0%, #32231c 58%, #5a3b29 100%)",
          color: "#eadcc8",
          padding: "76px 84px",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            right: -110,
            top: -150,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(217,164,96,.48), rgba(200,132,72,0) 68%)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", zIndex: 1 }}>
          <div style={{ display: "flex", fontFamily: "sans-serif", fontSize: 22, letterSpacing: 7, textTransform: "uppercase", color: "#c8ad8d" }}>
            Fotografia autorska
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", maxWidth: 980, fontSize: 92, lineHeight: .9, letterSpacing: -4 }}>
              Światło, cisza i chwile pomiędzy.
            </div>
            <div style={{ display: "flex", marginTop: 34, width: 190, height: 2, background: "#c88448" }} />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
