import { ImageResponse } from "next/og";
import { caller } from "@/trpc/server";

export const runtime = "nodejs";
export const alt = "DevRoast Result";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const roast = await caller.roasts.getRoastById({ id });

  if (!roast) {
    return new Response("Not Found", { status: 404 });
  }

  const score = Number(roast.score);

  // Dynamic colors based on score
  let scoreColor = "#00ff00"; // Green (good)
  if (score <= 3) {
    scoreColor = "#ff4444"; // Red (bad)
  } else if (score <= 6) {
    scoreColor = "#ffaa00"; // Orange (medium)
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          backgroundImage: "radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)",
          padding: "40px",
        }}
      >
        {/* Border Frame */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            right: 20,
            bottom: 20,
            border: "1px solid #333",
            display: "flex",
          }}
        />

        {/* Score Display (Removed Circle) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ fontSize: "128px", fontWeight: "bold", color: scoreColor }}>
              {score.toFixed(1)}
            </span>
            <span
              style={{
                fontSize: "32px",
                color: "#666",
                marginLeft: "8px",
                fontWeight: "bold",
                opacity: 0.5,
              }}
            >
              /10
            </span>
          </div>
        </div>

        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
          <span style={{ fontSize: "32px", color: scoreColor, fontWeight: "bold" }}>{">"}</span>
          <span
            style={{
              fontSize: "48px",
              color: "#ffffff",
              fontWeight: "bold",
              letterSpacing: "-0.05em",
              textTransform: "uppercase",
            }}
          >
            roast_results
          </span>
        </div>

        {/* Summary Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "#0a0a0a",
            border: `1px solid ${scoreColor}33`, // Subtle border with score color
            padding: "32px",
            maxWidth: "800px",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              color: "#666",
              marginBottom: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
            }}
          >
            {"// THE_VERDICT"}
          </span>
          <span
            style={{
              fontSize: "36px",
              color: "#ffffff",
              fontWeight: "bold",
              lineHeight: "1.2",
            }}
          >
            "{roast.roastSummary}"
          </span>
        </div>

        {/* Website Link */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "60px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "16px", color: "#444" }}>devroast.com</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
