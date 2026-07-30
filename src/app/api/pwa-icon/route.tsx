import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";

const SIZES: Record<string, number> = {
  "192": 192,
  "512": 512,
};

function Icon({ size, maskable }: { size: number; maskable: boolean }) {
  const padding = maskable ? Math.round(size * 0.1) : 0;
  const innerSize = size - padding * 2;
  const fontSize = Math.round(innerSize * 0.55);
  const borderRadius = maskable ? 0 : Math.round(size * 0.25);

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: maskable
          ? "linear-gradient(135deg, #4f46e5 0%, #06b6d4 45%, #22d3ee 100%)"
          : "transparent",
      }}
    >
      <div
        style={{
          width: innerSize,
          height: innerSize,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #4f46e5 0%, #06b6d4 45%, #22d3ee 100%)",
          borderRadius,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            color: "white",
            fontSize,
            fontWeight: 700,
            fontFamily: "system-ui, sans-serif",
            letterSpacing: "-0.06em",
            lineHeight: 1,
          }}
        >
          R
        </div>
      </div>
    </div>
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sizeParam = searchParams.get("size") || "192";
  const maskable = searchParams.get("maskable") === "1";
  const size = SIZES[sizeParam] || 192;

  return new ImageResponse(<Icon size={size} maskable={maskable} />, {
    width: size,
    height: size,
  });
}
