import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Rampungin — Free AI Prompt Marketplace";
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
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background:
            "linear-gradient(135deg, #0f172a 0%, #1d4ed8 48%, #93c5fd 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 42,
              fontWeight: 700,
            }}
          >
            R
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em" }}>
            Rampungin
          </div>
        </div>
        <div
          style={{
            fontSize: 58,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
            maxWidth: 900,
          }}
        >
          Free AI Prompt Marketplace
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 28,
            opacity: 0.9,
            maxWidth: 820,
            lineHeight: 1.35,
          }}
        >
          Ready-to-use prompts. Parameterized templates. Free forever.
        </div>
      </div>
    ),
    { ...size },
  );
}
